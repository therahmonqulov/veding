/* ===================================================
   index-elonlar.js — E'lonlarni index.html da ko'rsatish
   =================================================== */

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const { createClient } = window.supabase;
        const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        const { data, error } = await db
            .from('elonlar')
            .select('id, name, type, region, price, photos, created_at')
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;

        const toyContainer     = document.getElementById('toyElonlar');
        const marosimContainer = document.getElementById('marosimElonlar');

        const toylar     = (data || []).filter(e => e.type === 'toyxona');
        const marosimlar = (data || []).filter(e => e.type === 'marosim');

        renderCards(toylar,     toyContainer,     'toy_card',     'toy_overlay');
        renderCards(marosimlar, marosimContainer, 'marosim_card', 'marosim_overlay');

    } catch (err) {
        console.error("E'lonlar yuklanmadi:", err);
        ['toyElonlar','marosimElonlar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p style="color:#888;padding:20px;font-family:Montserrat">E\'lonlar topilmadi</p>';
        });
    }
});

function renderCards(items, container, cardClass, overlayClass) {
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<p style="color:#888;padding:20px;font-family:Montserrat">Hali e\'lonlar yo\'q</p>';
        return;
    }

    container.innerHTML = '';

    items.forEach(item => {
        const price   = item.price ? Number(item.price).toLocaleString('uz') + ' so\'m' : 'Narx kelishiladi';
        const dateStr = item.created_at ? formatDate(item.created_at) : '';

        // Kartochka tuzilishi
        const card = document.createElement('div');
        card.className = cardClass;
        card.style.cursor = 'pointer';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        // Rasm elementi — src ni alohida set qilamiz (base64 uchun xavfsiz)
        const img = document.createElement('img');
        img.alt = item.name || 'Rasm';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        if (item.photos && item.photos.length > 0) {
            // base64 yoki URL — ikkalasi ham ishlaydi
            img.src = item.photos[0];
        } else {
            img.src = './astess/img/1.png';
        }

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = overlayClass;
        overlay.innerHTML = `
            <span class="elon-card-name">${item.name || '—'}</span>
            <span class="elon-card-price">${price}</span>
            <span class="elon-card-date">${dateStr}</span>
        `;

        card.appendChild(img);
        card.appendChild(overlay);

        card.addEventListener('click', () => {
            window.location.href = './store.html?id=' + item.id;
        });

        container.appendChild(card);
    });
}

function filterElonlar(type) {
    window.location.href = './store.html?filter=' + type;
}

function formatDate(isoStr) {
    const d = new Date(isoStr);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    return day + '.' + month + '.' + year;
}
