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

(function type() {

    if (count === texts.length) {
        count = 0;
    }

    currentText = texts[count];
    letter = currentText.slice(0, ++index);

    input.setAttribute("placeholder", letter);

    if (letter.length === currentText.length) {
        setTimeout(() => {
            erase();
        }, 1500);
    } else {
        setTimeout(type, 80);
    }

})();

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
