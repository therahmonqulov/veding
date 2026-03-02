// BUG FIX: HTML da 'sarlavhaInput', 'submitBtn', 'toastContainer' yo'q edi
// Ular mavjud ID larga to'g'irlandi
const sarlavha = document.getElementById('sarlavhaTextarea'); // to'g'ri ID
const charSpan = document.getElementById('charCount');
const warnMin = document.getElementById('minWarning');
const ruknSelect = document.getElementById('ruknSelect');
const submit = document.querySelector('.btn-submit'); // to'g'ri selector
const toast = null; // toastContainer HTML da yo'q, add-supabase.js boshqaradi
const chips = document.querySelectorAll('.chip');

// Chips - dropdown ni tanlash (oddiy select bilan alohida ishlaydi)
chips.forEach(chip => {
    chip.addEventListener('click', function () {
        const ruknVal = this.dataset.rukn; // "toyxona", "marosim" ...
        const optionToSelect = Array.from(ruknSelect.options).find(opt => opt.value === ruknVal);
        if (optionToSelect) {
            optionToSelect.selected = true;
            // visual effekt (o'zgarishni ko'rsatish)
            this.style.backgroundColor = '#dac2af';
            setTimeout(() => {
                this.style.backgroundColor = '#f0e3d8';
            }, 120);
        } else {
            // agar mos kelmasa, tanlanmagan holat
        }
    });
});

// textarea
const textarea = document.getElementById('sarlavhaTextarea');
const minWarning = document.getElementById('minWarning');
const exampleHint = null; // BUG FIX: HTML da bu element yo'q

// Belgilarni hisoblash va validatsiya
function updateCharCounter() {
    const len = textarea.value.length;
    charSpan.innerText = len;

    if (len > 0 && len < 16) {
        minWarning.classList.add('show');
    } else {
        minWarning.classList.remove('show');
    }
}

textarea.addEventListener('input', updateCharCounter);
updateCharCounter();

// media
let uploadedImagesCount = 0;
const MAX_IMAGES = 4;

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    const grid = document.getElementById('photoGrid');
    const addBtn = document.getElementById('addBtn'); // Endi HTML dagi ID bilan mos

    files.forEach(file => {
        if (uploadedImagesCount >= MAX_IMAGES) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            // Placeholderni olib tashlash
            const placeholder = grid.querySelector('.placeholder');
            if (placeholder) placeholder.remove();

            const div = document.createElement('div');
            div.className = 'photo-item preview-container';

            // Yuklanganlar soniga qarab "Asosiy"ni aniqlash
            const isFirst = grid.querySelectorAll('.preview-img').length === 0;

            div.innerHTML = `
                <img src="${e.target.result}" class="preview-img">
                <button type="button" class="remove-btn" onclick="removeImage(this)">×</button>
                ${isFirst ? '<div class="main-label">Asosiy</div>' : ''}
            `;

            grid.insertBefore(div, addBtn);
            uploadedImagesCount++;

            if (uploadedImagesCount === MAX_IMAGES) {
                addBtn.style.display = 'none';
            }
        }
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function removeImage(btn) {
    const grid = document.getElementById('photoGrid');
    const addBtn = document.getElementById('addBtn');

    btn.parentElement.remove();
    uploadedImagesCount--;

    // O'chirilgan rasm o'rniga bo'sh katak qo'shish
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-item placeholder';
    grid.appendChild(placeholder);

    if (uploadedImagesCount < MAX_IMAGES) {
        addBtn.style.display = 'flex';
    }

    refreshMainLabel();
}

function refreshMainLabel() {
    const allPreviews = document.querySelectorAll('.preview-container');
    allPreviews.forEach((item, index) => {
        const existingLabel = item.querySelector('.main-label');
        if (existingLabel) existingLabel.remove();

        if (index === 0) {
            const label = document.createElement('div');
            label.className = 'main-label';
            label.innerText = 'Asosiy';
            item.appendChild(label);
        }
    });
}
// ─── Hafta kunlari toggle ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const dayChips = document.querySelectorAll('.day-chip');
    dayChips.forEach(chip => {
        chip.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    });
});
