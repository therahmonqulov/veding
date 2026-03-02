/* ===================================================
   add-supabase.js — Storage ishlatmasdan,
   rasmlar base64 sifatida bazaga saqlanadi.
   RLS muammosi yo'q.
   =================================================== */

(function () {

    // ─── Supabase mijozini yaratish ──────────────────────────────────────────
    function getSupabaseClient() {
        const sbLib = window.supabase || supabase;
        const { createClient } = sbLib;
        return createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }

    // ─── Rasmlarni base64 sifatida yig'ish ──────────────────────────────────
    function collectBase64Images() {
        const previews = document.querySelectorAll('#photoGrid .preview-img');
        const images = [];
        previews.forEach((img) => {
            const dataUrl = img.src;
            if (dataUrl.startsWith('data:')) {
                images.push(dataUrl); // to'liq base64 string
            }
        });
        return images;
    }

    // ─── Formadan ma'lumot yig'ish ───────────────────────────────────────────
    function collectFormData() {
        const nameInput = document.querySelector('input[name="BinoNomi"]');
        const name = nameInput ? nameInput.value.trim() : '';

        const regionSelect = document.getElementById('regionSelect');
        const region = regionSelect ? regionSelect.value : '';

        const ruknSelect = document.getElementById('ruknSelect');
        const type = ruknSelect ? ruknSelect.value : '';

        const textarea = document.getElementById('sarlavhaTextarea');
        const description = textarea ? textarea.value.trim() : '';

        const dayChips = document.querySelectorAll('.day-chip');
        const workDays = [];
        dayChips.forEach((chip, idx) => {
            if (chip.classList.contains('active')) workDays.push(idx);
        });

        const workStart = document.querySelector('input[name="workStart"]')?.value || '08:00';
        const workEnd = document.querySelector('input[name="workEnd"]')?.value || '23:00';
        const work24h = document.querySelector('.switch input[type="checkbox"]')?.checked || false;

        const capacity = parseInt(document.querySelector('input[name="addInfo_count"]')?.value || 0);
        const area = document.querySelector('input[name="addInfo_size"]')?.value?.trim() || '';
        const floors = document.querySelector('input[name="addInfo_layer"]')?.value?.trim() || '';

        const smokingSelects = document.querySelectorAll('.simple-dropdown');
        let smoking = 'no';
        smokingSelects.forEach(sel => {
            if (sel.options.length > 0 && sel !== document.getElementById('regionSelect') && sel !== document.getElementById('ruknSelect')) {
                smoking = sel.value;
            }
        });

        const alcoholRadio = document.querySelector('input[name="alcohol"]:checked');
        const alcohol = alcoholRadio ? alcoholRadio.value : 'no';

        const price = parseFloat(document.querySelector('input[name="addCost"]')?.value || 0);

        const phoneInputs = document.querySelectorAll('input[name="addContact"]');
        const phone = phoneInputs[0]?.value?.trim() || '';
        const email = phoneInputs[1]?.value?.trim() || '';
        const instagram = document.querySelector('input[name="instagram"]')?.value?.trim() || '';
        const telegram = document.querySelector('input[name="telegram"]')?.value?.trim() || '';

        // Foydalanuvchi email (profil uchun)
        const userEmail = (() => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return null;
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.email || null;
            } catch(e) { return null; }
        })();

        return { name, region, type, description, workDays, workStart, workEnd, work24h, capacity, area, floors, smoking, alcohol, price, phone, email, instagram, telegram, userEmail };
    }

    // ─── Validatsiya ─────────────────────────────────────────────────────────
    function validateForm(data) {
        const errors = [];
        if (!data.name) errors.push("Bino nomini kiriting");
        if (!data.region) errors.push("Hududni tanlang");
        if (!data.type) errors.push("Bino turini tanlang");
        if (!data.description || data.description.length < 16) errors.push("Tavsif kamida 16 ta belgi bo'lishi kerak");
        if (!data.phone) errors.push("Telefon raqamini kiriting");
        const photos = document.querySelectorAll('#photoGrid .preview-img');
        if (photos.length === 0) errors.push("Kamida 1 ta rasm yuklang");
        const agreed = document.querySelector('.check-container input[type="checkbox"]')?.checked;
        if (!agreed) errors.push("Foydalanish shartlariga rozilik bering");
        return errors;
    }

    // ─── Toast ───────────────────────────────────────────────────────────────
    function showToast(message, type = 'error') {
        let toast = document.getElementById('supabase-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'supabase-toast';
            toast.style.cssText = `
                position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                padding: 14px 24px; border-radius: 12px; font-size: 0.9rem;
                z-index: 9999; max-width: 400px; text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transition: opacity 0.3s; font-weight: 500;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.background = type === 'success' ? '#4caf50' : type === 'info' ? '#b78d6a' : '#e53935';
        toast.style.color = '#fff';
        toast.style.opacity = '1';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
    }

    // ─── Submit ───────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const submitBtn = document.querySelector('.btn-submit');
        if (!submitBtn) return;

        submitBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const formData = collectFormData();
            const errors = validateForm(formData);

            if (errors.length > 0) {
                showToast(errors[0]);
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Saqlanmoqda...';

            try {
                const db = getSupabaseClient();

                // Rasmlarni base64 sifatida olish (Storage kerak emas)
                showToast('Rasmlar tayyorlanmoqda...', 'info');
                const photoBase64Array = collectBase64Images();

                // E'lonni bazaga yozish
                showToast("E'lon saqlanmoqda...", 'info');
                const { data: insertedData, error: insertError } = await db
                    .from('elonlar')
                    .insert([{
                        name: formData.name,
                        region: formData.region,
                        type: formData.type,
                        description: formData.description,
                        photos: photoBase64Array,   // base64 array
                        capacity: formData.capacity || null,
                        area: formData.area || null,
                        floors: formData.floors || null,
                        work_days: formData.workDays,
                        work_start: formData.workStart,
                        work_end: formData.workEnd,
                        work_24h: formData.work24h,
                        smoking: formData.smoking,
                        alcohol: formData.alcohol,
                        price: formData.price || null,
                        phone: formData.phone,
                        instagram: formData.instagram || null,
                        telegram: formData.telegram || null,
                        email: formData.email || null,
                        user_email: formData.userEmail || null,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (insertError) throw new Error(insertError.message);

                showToast("E'lon muvaffaqiyatli joylashtirildi! ✅", 'success');
                setTimeout(() => {
                    window.location.href = `./store.html?id=${insertedData.id}`;
                }, 1200);

            } catch (err) {
                console.error("E'lon yuklash xatosi:", err);
                showToast(err.message || "Xato yuz berdi. Qayta urinib ko'ring.");
                submitBtn.disabled = false;
                submitBtn.textContent = "E'lonni joylashtirish";
            }
        });
    });

})();