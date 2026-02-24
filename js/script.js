document.addEventListener('DOMContentLoaded', () => {
    const texts = [
        "To'y zali qidiring...",
        "Oshpaz va xizmatlarni toping...",
        "Fotograf yoki videograf izlang...",
        "Bezak xizmati buyurtma qiling...",
        "Marosim rejalashtirishni boshlang..."
    ];

    let count = 0;
    let index = 0;
    let currentText = "";
    let letter = "";
    const input = document.getElementById("searchInput");

    function type() {

        if (count === texts.length) {
            count = 0;
        }

        currentText = texts[count];
        letter = currentText.slice(0, ++index);

        input.setAttribute("placeholder", letter);

        if (letter.length === currentText.length) {
            setTimeout(erase, 1500);
        } else {
            setTimeout(type, 80);
        }
    }

    function erase() {
        letter = currentText.slice(0, --index);
        input.setAttribute("placeholder", letter);

        if (letter.length === 0) {
            count++;
            setTimeout(type, 200);
        } else {
            setTimeout(erase, 50);
        }
    }

    type();


    // main fayliga
    const token = localStorage.getItem('token');
    let currentUser = null;
    const API_BASE = 'http://localhost:3000/api';

    // Elementlar
    const menuCreateLi = document.getElementById('menu-create-li');
    const heroCreateBtn = document.getElementById('hero-create-btn');

    // Modallar
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeBtns = document.querySelectorAll('.close');

    // Modalni ochish
    function showModal(modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');  // ← fon scrollini to'xtatish
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }

    // Modalni yopish
    function hideModal(modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.setProperty('--scrollbar-width', '0px');
    }
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        hideModal(loginModal);
        hideModal(registerModal);
    }));

    window.addEventListener('click', e => {
        if (e.target === loginModal) hideModal(loginModal);
        if (e.target === registerModal) hideModal(registerModal);
    });

    // Foydalanuvchini yuklash
    async function fetchUser() {
        if (!token) return null;
        try {
            const res = await fetch(`${API_BASE}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) return await res.json();
            localStorage.removeItem('token');
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    function updateUI() {
        const logged = !!currentUser;

        // menu user block (o'zgarmasdan qoladi)
        const menuUserBlock = document.getElementById('menuUserBlock');
        const userAvatarEl = document.getElementById('userAvatar');
        const userNameEl = document.getElementById('userNameDisplay');

        if (menuUserBlock) {
            if (logged) {
                const name = currentUser.name || 'Foydalanuvchi';
                const avatarLetter = name.charAt(0).toUpperCase();

                userAvatarEl.textContent = avatarLetter;
                userNameEl.textContent = name;
                menuUserBlock.style.display = 'block';
            } else {
                menuUserBlock.style.display = 'none';
            }
        }

        //  Hero tugmasi
        if (heroCreateBtn) {
            if (logged) {
                const userName = currentUser.name || 'Foydalanuvchi';
                heroCreateBtn.innerHTML = `
                <img src="./astess/img/user.png" alt="img" loading="lazy" decoding="async">
                ${userName}
            `;
                heroCreateBtn.onclick = () => {
                    window.location.href = '/profile.html';
                };
            } else {
                heroCreateBtn.innerHTML = `
                <img src="./astess/img/user-add.png" alt="img" loading="lazy" decoding="async">
                Ro'yxatdan o'tish
            `;
                heroCreateBtn.onclick = () => showModal(registerModal);
            }
        }

        //  Menyudagi "E'lon Yaratish" havolasi
        if (menuCreateLi) {
            const link = menuCreateLi.querySelector('a');
            if (link) {
                link.onclick = (e) => {
                    e.preventDefault();

                    if (logged) {
                        window.location.href = '/add.html';
                    } else {
                        showModal(registerModal);
                    }
                };
            }
        }
    }

    // Umumiy yordamchi funksiyalar
    function showError(spanId, message) {
        const span = document.getElementById(spanId);
        if (span) {
            span.textContent = message;
            // inputni topib, chegara qo'yish (agar kerak bo'lsa)
            const input = span.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                input.classList.add('error-border');
            }
        }
    }
    function clearError(spanId) {
        const span = document.getElementById(spanId);
        if (span) {
            span.textContent = '';
            const input = span.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                input.classList.remove('error-border');
            }
        }
    }

    function clearAllErrors(formId) {
        document.querySelectorAll(`#${formId} .error-message`).forEach(span => {
            span.textContent = '';
        });
        document.querySelectorAll(`#${formId} input`).forEach(inp => {
            inp.classList.remove('error-border');
        });
    }

    // Real-time tekshiruv (foydalanuvchi yozayotganda xato yo'qolsin)
    function attachLiveValidation() {
        // Registratsiya
        const regName = document.getElementById('regUsername');
        const regEmail = document.getElementById('regEmail');
        const regPass = document.getElementById('regPassword');

        if (regName) regName.addEventListener('input', () => clearError('name_error'));
        if (regEmail) regEmail.addEventListener('input', () => clearError('email_error'));
        if (regPass) regPass.addEventListener('input', () => clearError('password_error'));

        // Login
        const loginEmail = document.getElementById('loginUsername');
        const loginPass = document.getElementById('loginPassword');  // ID ni moslashtiring

        if (loginEmail) loginEmail.addEventListener('input', () => clearError('loginName_error'));
        if (loginPass) loginPass.addEventListener('input', () => clearError('loginPassword_error'));
    }

    // Login formasi
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors('login-form');

            const email = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email) {
                showError('loginName_error', 'E-mail kiritilishi shart');
                return;
            }
            if (!password) {
                showError('loginPassword_error', 'Parol kiritilishi shart');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    currentUser = data.user;
                    hideModal(loginModal);
                    updateUI();
                } else {
                    const msg = data.message || 'Xatolik yuz berdi';

                    if (msg.includes('Email') || msg.includes('topilmadi')) {
                        showError('loginName_error', 'Bunday email topilmadi');
                    } else if (msg.includes('parol') || msg.includes('noto‘g‘ri')) {
                        showError('loginPassword_error', 'Parol noto‘g‘ri');
                    } else {
                        showError('loginName_error', msg);
                    }
                }
            } catch (err) {
                showError('loginName_error', 'Server bilan ulanishda muammo');
            }
        });
    }

    // Registratsiya formasi
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors('register-form');

            const name = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;

            let hasError = false;

            // 1. Ism uzunligi
            if (name.length === 0) {
                showError('name_error', 'Ism kiritilishi shart');
                hasError = true;
            } else if (name.length > 11) {
                showError('name_error', 'Ism 11 ta belgidan oshmasligi kerak');
                hasError = true;
            }

            // 2. Email formati (oddiy regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email_error', 'E-mail manzili noto‘g‘ri formatda');
                hasError = true;
            }

            // 3. Parol uzunligi
            if (password.length < 8) {
                showError('password_error', 'Parol kamida 8 ta belgi bo‘lishi kerak');
                hasError = true;
            } else if (password.length > 12) {
                showError('password_error', 'Parol 12 ta belgidan ko‘p bo‘lmasligi kerak');
                hasError = true;
            }

            if (hasError) return;

            // Backendga so‘rov
            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    currentUser = data.user;
                    hideModal(registerModal);
                    updateUI();
                    // muvaffaqiyatli bo'lsa hammasi tozalanadi
                } else {
                    // email allaqachon mavjud
                    if (data.message.includes('allaqachon')) {
                        showError('email_error', 'Bu email ro‘yxatdan o‘tgan');
                    } else {
                        showError('email_error', data.message || 'Xatolik yuz berdi');
                    }
                }
            } catch (err) {
                showError('email_error', 'Server bilan ulanishda muammo');
            }
        });
    }

    // Sahifa yuklanganda live validationni ishga tushirish
    attachLiveValidation();

    // Modal o'tish
    document.getElementById('to-register').addEventListener('click', e => {
        e.preventDefault(); hideModal(loginModal); showModal(registerModal);
    });
    document.getElementById('to-login').addEventListener('click', e => {
        e.preventDefault(); hideModal(registerModal); showModal(loginModal);
    });

    // Boshlash
    async function init() {
        if (token) currentUser = await fetchUser();
        updateUI();
    }
    init();
});