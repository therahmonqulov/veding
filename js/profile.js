/* ===== profile.js — Profil + foydalanuvchi e'lonlari ===== */

document.addEventListener('DOMContentLoaded', async function () {

    const profileCard          = document.getElementById('profileCard');
    const profileLoginRequired = document.getElementById('profileLoginRequired');
    const profileSection       = document.getElementById('profileSection');
    const profileAvatar        = document.getElementById('profileAvatar');
    const profileName          = document.getElementById('profileName');
    const profileEmail         = document.getElementById('profileEmail');
    const logoutBtn            = document.getElementById('logoutBtn');
    const goLoginBtn           = document.getElementById('goLoginBtn');
    const profileElonlar       = document.getElementById('profileElonlar');

    const token = localStorage.getItem('token');

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://veding-server.vercel.app/api';

    // ─── Login qilinmagan ──────────────────────────────────────────────────
    if (!token) {
        if (profileCard)          profileCard.style.display          = 'none';
        if (profileSection)       profileSection.style.display       = 'none';
        if (profileLoginRequired) profileLoginRequired.style.display = 'block';
        return;
    }

    // ─── Foydalanuvchini yuklash ──────────────────────────────────────────
    async function loadProfile() {
        try {
            const res = await fetch(API_BASE + '/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!res.ok) {
                localStorage.removeItem('token');
                if (profileCard)          profileCard.style.display          = 'none';
                if (profileSection)       profileSection.style.display       = 'none';
                if (profileLoginRequired) profileLoginRequired.style.display = 'block';
                return null;
            }

            const user = await res.json();
            const name = user.name || 'Foydalanuvchi';
            if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();
            if (profileName)   profileName.textContent   = name;
            if (profileEmail)  profileEmail.textContent  = user.email || '—';
            return user;

        } catch (err) {
            console.error('Profil yuklash xatosi:', err);
            return null;
        }
    }

    // ─── E'lonlarni yuklash ───────────────────────────────────────────────
    async function loadMyElonlar(userEmail) {
        if (!profileElonlar) return;
        profileElonlar.innerHTML = '<p class="elon-loading">E\'lonlar yuklanmoqda...</p>';

        try {
            const { createClient } = window.supabase;
            const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

            const { data, error } = await db
                .from('elonlar')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                profileElonlar.innerHTML = `
                    <div class="no-elonlar">
                        <span>📭</span>
                        <p>Hali e'lonlaringiz yo'q</p>
                        <a href="./add.html" class="btn-add-elon">E'lon qo'shish</a>
                    </div>`;
                return;
            }

            profileElonlar.innerHTML = '';

            const regionMap = {
                toshkent: 'Toshkent sh.', toshkent_v: 'Toshkent vil.',
                samarqand: 'Samarqand', fargona: "Farg'ona",
                andijon: 'Andijon', namangan: 'Namangan',
                buxoro: 'Buxoro', navoiy: 'Navoiy',
                qashqadaryo: 'Qashqadaryo', surxondaryo: 'Surxondaryo',
                xorazm: 'Xorazm'
            };

            data.forEach(item => {
                const price       = item.price ? Number(item.price).toLocaleString('uz') + ' so\'m' : 'Narx kelishiladi';
                const dateStr     = item.created_at ? formatDate(item.created_at) : '';
                const typeLabel   = item.type === 'toyxona' ? "To'yxona" : 'Marosim';
                const regionLabel = regionMap[item.region] || item.region || '—';

                // Kartochka
                const card = document.createElement('div');
                card.className = 'profile-elon-card';

                // Rasm qismi
                const imgWrap = document.createElement('div');
                imgWrap.className = 'pec-img';

                const img = document.createElement('img');
                img.alt     = item.name || 'Rasm';
                img.loading = 'lazy';
                // base64 yoki URL — img.src ga to'g'ridan-to'g'ri beriladi
                img.src = (item.photos && item.photos.length > 0)
                    ? item.photos[0]
                    : './astess/img/1.png';

                const typeBadge = document.createElement('span');
                typeBadge.className   = 'pec-type';
                typeBadge.textContent = typeLabel;

                imgWrap.appendChild(img);
                imgWrap.appendChild(typeBadge);

                // Info qismi
                const info = document.createElement('div');
                info.className = 'pec-info';
                info.innerHTML = `
                    <h3 class="pec-name">${item.name || '—'}</h3>
                    <p class="pec-region">📍 ${regionLabel}</p>
                    <p class="pec-price">💰 ${price}</p>
                    <p class="pec-date">📅 ${dateStr}</p>
                `;

                // Tugmalar
                const actions = document.createElement('div');
                actions.className = 'pec-actions';
                actions.innerHTML = `<a href="./store.html?id=${item.id}" class="pec-btn pec-btn-view">Ko'rish</a>`;

                card.appendChild(imgWrap);
                card.appendChild(info);
                card.appendChild(actions);

                profileElonlar.appendChild(card);
            });

        } catch (err) {
            console.error("E'lonlar yuklanmadi:", err);
            profileElonlar.innerHTML = '<p style="color:#888;padding:20px;font-family:Montserrat">E\'lonlar yuklanmadi. Sahifani yangilang.</p>';
        }
    }

    function formatDate(isoStr) {
        const d     = new Date(isoStr);
        const day   = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year  = d.getFullYear();
        return day + '.' + month + '.' + year;
    }

    // ─── Ishga tushirish ──────────────────────────────────────────────────
    const user = await loadProfile();
    if (user && user.email) {
        await loadMyElonlar(user.email);
    }

    // ─── Chiqish ──────────────────────────────────────────────────────────
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = './index.html';
        });
    }

    if (goLoginBtn) {
        goLoginBtn.addEventListener('click', function () {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.classList.add('show');
                document.body.classList.add('modal-open');
            }
        });
    }
});
