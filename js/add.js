const sarlavha = document.getElementById('sarlavhaInput');
const charSpan = document.getElementById('charCount');
const warnMin = document.getElementById('minWarning');
const ruknSelect = document.getElementById('ruknSelect');
const submit = document.getElementById('submitBtn');
const toast = document.getElementById('toastContainer');
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
const exampleHint = document.getElementById('exampleHint');

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