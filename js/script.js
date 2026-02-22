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

        // Hero tugmasi
        if (heroCreateBtn) {
            if (logged) {
                heroCreateBtn.innerHTML = `<img src="./astess/img/add.png" alt="img" loading="lazy" decoding="async"> E'lon Yaratish`;
                heroCreateBtn.onclick = () => alert("E'lon yaratish oynasi tez orada qo'shiladi! 🔥");
            } else {
                heroCreateBtn.innerHTML = `<img src="./astess/img/user-add.png" alt="img" loading="lazy" decoding="async"> Ro'yxatdan o'tish`;
                heroCreateBtn.onclick = () => showModal(registerModal);
            }
        }

        // E'lon Yaratish tugmalari — har doim ko'rinadi, lekin funksiyasi farq qiladi
        const createHandler = logged
            ? () => alert("E'lon yaratish oynasi tez orada qo'shiladi! 🔥")   // keyinroq sahifaga o'tkazamiz
            : () => showModal(registerModal);  // yoki loginModal — xohishingizga qarab

        if (menuCreateLi) {
            menuCreateLi.querySelector('a').onclick = (e) => {
                e.preventDefault();
                createHandler();
            };
        }

        if (heroCreateBtn) {
            heroCreateBtn.onclick = createHandler;
        }
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

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
            } else alert(data.message || 'Xatolik yuz berdi');
        } catch (err) { alert('Server bilan bog\'lanishda muammo'); }
    });

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('input[name="name"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;

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
            } else alert(data.message || 'Xatolik yuz berdi');
        } catch (err) { alert('Server bilan bog\'lanishda muammo'); }
    });

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
