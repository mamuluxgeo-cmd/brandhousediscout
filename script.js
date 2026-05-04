const API = "https://script.google.com/macros/s/AKfycbycf1cw8dNZJ5zC6gL9BgZ0uzlC-aDdtAtBtkB2Vwfi9-u7846J1O14GXf-lxunWoWu/exec";

const CACHE_KEY = "bh_discount_brands_cache";
const CACHE_TIME_KEY = "bh_discount_brands_cache_time";
const CACHE_DURATION = 10 * 60 * 1000;

const priceInput = document.getElementById("price");
const brandsContainer = document.getElementById("brands");
const resultEl = document.getElementById("result");

let selectedDiscount = 0;

async function loadBrands() {
  const cachedBrands = localStorage.getItem(CACHE_KEY);
  const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY));
  const now = Date.now();

  if (cachedBrands && cachedTime && now - cachedTime < CACHE_DURATION) {
    renderBrands(JSON.parse(cachedBrands));
    return;
  }

  try {
    const res = await fetch(API);
    const data = await res.json();

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, String(now));

    renderBrands(data);
  } catch (error) {
    if (cachedBrands) {
      renderBrands(JSON.parse(cachedBrands));
      return;
    }

    brandsContainer.innerHTML = `<div class="loading">მონაცემები ვერ ჩაიტვირთა</div>`;
    console.error(error);
  }
}

function renderBrands(data) {
  if (!data || data.length === 0) {
    brandsContainer.innerHTML = `<div class="loading">ბრენდები ჯერ დამატებული არ არის</div>`;
    return;
  }

  brandsContainer.innerHTML = data.map(brand => `
    <button class="brand-btn" data-discount="${brand.discount}">
      <span class="brand-name">${brand.name}</span>
      <span class="brand-discount">-${Math.round(brand.discount)}%</span>
    </button>
  `).join("");

  document.querySelectorAll(".brand-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".brand-btn").forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      selectedDiscount = Number(button.dataset.discount);
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

  const finalPrice = Math.round(price - (price * selectedDiscount / 100));
  resultEl.textContent = finalPrice + " ₾";
}

priceInput.addEventListener("input", calculate);

document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
});

loadBrands();
