const API = "https://script.google.com/macros/s/AKfycbycf1cw8dNZJ5zC6gL9BgZ0uzlC-aDdtAtBtkB2Vwfi9-u7846J1O14GXf-lxunWoWu/exec";

const priceInput = document.getElementById("price");
const brandsContainer = document.getElementById("brands");
const resultEl = document.getElementById("result");

let selectedDiscount = 0;

async function loadBrands() {
  const res = await fetch(API);
  const data = await res.json();

  brandsContainer.innerHTML = data.map(b => `
    <button class="brand-btn" data-discount="${b.discount}">
      ${b.name}
    </button>
  `).join("");

  document.querySelectorAll(".brand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".brand-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      selectedDiscount = Number(btn.dataset.discount);
      calculate();
    });
  });
}

function calculate() {
  const price = Number(priceInput.value);

  if (!price || !selectedDiscount) {
    resultEl.textContent = "0 ₾";
    return;
  }

  const final = Math.round(price - (price * selectedDiscount / 100));
  resultEl.textContent = final + " ₾";
}

priceInput.addEventListener("input", calculate);

loadBrands();
