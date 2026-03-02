/* ===== store.js — E'lon ko'rish va ro'yxat sahifasi ===== */

let _allElonlar = [];

document.addEventListener('DOMContentLoaded', async function () {

    const params = new URLSearchParams(window.location.search);
    const elonId = params.get('id');

    if (typeof window.SUPABASE_URL === 'undefined' || typeof window.SUPABASE_ANON_KEY === 'undefined') {
        showError();
        return;
    }

    const { createClient } = window.supabase || supabase;
    const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    if (elonId) {
        // ─── BITTA E'LON KO'RISH REJIMI ──────────────────────────────────────
        try {
            const { data, error } = await db
                .from('elonlar')
                .select('*')
                .eq('id', elonId)
                .single();

            if (error || !data) { showError(); return; }

            document.getElementById('storeLoading').style.display = 'none';
            renderStore(data);

        } catch (err) {
            console.error('Store yuklash xatosi:', err);
            showError();
        }

    } else {
        // ─── BARCHA E'LONLAR RO'YXATI REJIMI ─────────────────────────────────
        document.getElementById('storeLoading').style.display = 'none';
        document.getElementById('storeList').style.display = 'block';
        document.title = "Zallar va Binolar — veding.uz";

        try {
            const { data, error } = await db
                .from('elonlar')
                .select('id, name, type, region, price, photos, capacity, created_at')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            _allElonlar = data || [];
            document.getElementById('storeListLoading').style.display = 'none';
            renderStoreList(_allElonlar);

        } catch (err) {
            console.error("E'lonlar yuklanmadi:", err);
            document.getElementById('storeListLoading').style.display = 'none';
            document.getElementById('storeListEmpty').innerHTML = "<p>E'lonlar yuklanmadi. Qayta urinib ko'ring.</p>";
            document.getElementById('storeListEmpty').style.display = 'block';
        }
    }
});

// ─── FILTER FUNKSIYASI ────────────────────────────────────────────────────────
function filterStoreList(type) {
    document.querySelectorAll('.filter-tab').forEach(function(btn) { btn.classList.remove('active'); });
    event.target.classList.add('active');
    if (type === 'all') {
        renderStoreList(_allElonlar);
    } else {
        renderStoreList(_allElonlar.filter(function(e) { return e.type === type; }));
    }
}

// ─── E'LONLAR RO'YXATINI RENDER QILISH ───────────────────────────────────────
function renderStoreList(items) {
    const grid = document.getElementById('storeCardsGrid');
    const emptyEl = document.getElementById('storeListEmpty');
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';

    const regionMap = {
        toshkent: 'Toshkent sh.', toshkent_v: 'Toshkent vil.', samarqand: 'Samarqand',
        fargona: "Farg'ona", andijon: 'Andijon', namangan: 'Namangan',
        buxoro: 'Buxoro', navoiy: 'Navoiy', qashqadaryo: 'Qashqadaryo',
        surxondaryo: 'Surxondaryo', jizzax: 'Jizzax', sirdaryo: 'Sirdaryo',
        xorazm: 'Xorazm', qoraqalpogiston: "Qoraqalpog'iston"
    };

    items.forEach(function(item) {
        const card = document.createElement('div');
        card.className = 'store-list-card';
        card.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.className = 'store-list-card-img';
        img.alt = item.name || 'Rasm';
        img.loading = 'lazy';
        img.src = (item.photos && item.photos.length > 0) ? item.photos[0] : './astess/img/1.png';

        const info = document.createElement('div');
        info.className = 'store-list-card-info';
        const typeName = item.type === 'toyxona' ? "To'yxona" : 'Marosim zali';
        const regionName = regionMap[item.region] || item.region || '—';
        const priceText = item.price ? Number(item.price).toLocaleString('uz') + " so'm" : 'Narx kelishiladi';
        const capacityText = item.capacity ? item.capacity + ' kishi' : '';

        info.innerHTML = '<div class="slc-badge">' + typeName + '</div>' +
            '<h3 class="slc-name">' + (item.name || '—') + '</h3>' +
            '<div class="slc-meta">' +
                '<span class="slc-region">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>' +
                    '</svg> ' + regionName +
                '</span>' +
                (capacityText ? '<span class="slc-capacity">' + capacityText + '</span>' : '') +
            '</div>' +
            '<div class="slc-price">' + priceText + '</div>';

        card.appendChild(img);
        card.appendChild(info);
        card.addEventListener('click', function() {
            window.location.href = './store.html?id=' + item.id;
        });
        grid.appendChild(card);
    });
}

// ─── BITTA E'LON RENDER QILISH ────────────────────────────────────────────────
function renderStore(d) {
    const mainPhoto = document.getElementById('mainPhoto');
    const galleryThumbs = document.getElementById('galleryThumbs');
    const galleryBadge = document.getElementById('galleryBadge');
    const photos = Array.isArray(d.photos) ? d.photos : [];

    if (photos.length > 0) {
        mainPhoto.src = photos[0];
        mainPhoto.alt = d.name || 'Rasm';
        galleryBadge.textContent = d.type === 'toyxona' ? "To'yxona" : 'Marosim';

        photos.forEach(function(photoSrc, idx) {
            const thumb = document.createElement('div');
            thumb.className = 'thumb' + (idx === 0 ? ' active' : '');
            const thumbImg = document.createElement('img');
            thumbImg.src = photoSrc;
            thumbImg.alt = 'Rasm ' + (idx + 1);
            thumbImg.loading = 'lazy';
            thumb.appendChild(thumbImg);
            thumb.addEventListener('click', function() {
                mainPhoto.src = photoSrc;
                document.querySelectorAll('.gallery-thumbs .thumb').forEach(function(t) { t.classList.remove('active'); });
                thumb.classList.add('active');
            });
            galleryThumbs.appendChild(thumb);
        });
    }

    document.getElementById('storeName').textContent = d.name || '—';
    document.getElementById('storeType').textContent = d.type === 'toyxona' ? "To'yxona" : 'Marosim';

    const regionMap = {
        toshkent: 'Toshkent sh.', toshkent_v: 'Toshkent vil.', samarqand: 'Samarqand',
        fargona: "Farg'ona", andijon: 'Andijon', namangan: 'Namangan',
        buxoro: 'Buxoro', navoiy: 'Navoiy', qashqadaryo: 'Qashqadaryo',
        surxondaryo: 'Surxondaryo', jizzax: 'Jizzax', sirdaryo: 'Sirdaryo',
        xorazm: 'Xorazm', qoraqalpogiston: "Qoraqalpog'iston"
    };
    document.getElementById('storeRegion').innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ' +
        (regionMap[d.region] || d.region || '—');

    document.getElementById('storePrice').textContent = d.price ? Number(d.price).toLocaleString('uz') : '—';
    document.getElementById('storeDesc').textContent = d.description || '—';

    const featuresEl = document.getElementById('storeFeatures');
    [
        { label: (d.capacity || '—') + ' kishi', icon: '👥' },
        { label: (d.area || '—') + ' m²', icon: '📐' },
        { label: (d.floors || '—') + ' qavat', icon: '🏢' }
    ].forEach(function(f) {
        const chip = document.createElement('div');
        chip.className = 'feature-chip';
        chip.innerHTML = '<span>' + f.icon + '</span><span>' + f.label + '</span>';
        featuresEl.appendChild(chip);
    });

    const daysEl = document.getElementById('scheduleDays');
    const activeDays = Array.isArray(d.work_days) ? d.work_days : [];
    ['Dush','Sesh','Chor','Pay','Jum','Shan','Yak'].forEach(function(name, idx) {
        const span = document.createElement('span');
        span.className = 'schedule-day ' + (activeDays.includes(idx) ? 'active' : 'inactive');
        span.textContent = name;
        daysEl.appendChild(span);
    });

    document.getElementById('scheduleTime').textContent = d.work_24h
        ? '🕐 Kecha-yu kunduz ishlaydi'
        : '🕐 ' + (d.work_start || '08:00') + ' — ' + (d.work_end || '23:00');

    const rulesEl = document.getElementById('storeRules');
    const smokingMap = {
        no: { icon: '🚭', cls: 'no', text: "Chekish taqiqlangan" },
        only_special: { icon: '🚬', cls: 'warn', text: "Faqat maxsus joyda chekish mumkin" },
        yes: { icon: '✅', cls: 'ok', text: "Chekishga ruxsat berilgan" }
    };
    const alcoholMap = {
        no: { icon: '🚫', cls: 'no', text: "Spirtli ichimliklar taqiqlangan" },
        yes: { icon: '✅', cls: 'ok', text: "Spirtli ichimliklarga ruxsat" }
    };
    [smokingMap[d.smoking] || smokingMap.no, alcoholMap[d.alcohol] || alcoholMap.no].forEach(function(rule) {
        const div = document.createElement('div');
        div.className = 'rule-item';
        div.innerHTML = '<div class="rule-icon ' + rule.cls + '">' + rule.icon + '</div><span>' + rule.text + '</span>';
        rulesEl.appendChild(div);
    });

    if (d.phone) {
        document.getElementById('storePhone').href = 'tel:' + d.phone;
        document.getElementById('storePhoneText').textContent = d.phone;
    }
    if (d.instagram) {
        const igBtn = document.getElementById('storeInstagram');
        igBtn.href = 'https://instagram.com/' + d.instagram;
        igBtn.style.display = 'flex';
    }
    if (d.telegram) {
        const tgBtn = document.getElementById('storeTelegram');
        tgBtn.href = 'https://t.me/' + d.telegram;
        tgBtn.style.display = 'flex';
    }
    if (d.email) {
        const emailBtn = document.getElementById('storeEmail');
        emailBtn.href = 'mailto:' + d.email;
        document.getElementById('storeEmailText').textContent = d.email;
        emailBtn.style.display = 'flex';
    }

    if (d.created_at) {
        const date = new Date(d.created_at);
        document.getElementById('storeDate').textContent =
            String(date.getDate()).padStart(2,'0') + '.' +
            String(date.getMonth()+1).padStart(2,'0') + '.' +
            date.getFullYear();
    }

    document.title = (d.name || "E'lon") + ' — veding.uz';
    document.getElementById('storeContent').style.display = 'block';
}

// ─── XATO HOLATI ──────────────────────────────────────────────────────────────
function showError() {
    document.getElementById('storeLoading').style.display = 'none';
    document.getElementById('storeError').style.display = 'flex';
}
