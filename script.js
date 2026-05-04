const API = "https://script.google.com/macros/s/AKfycbycf1cw8dNZJ5zC6gL9BgZ0uzlC-aDdtAtBtkB2Vwfi9-u7846J1O14GXf-lxunWoWu/exec";

const CACHE_KEY = "bh_discount_brands_cache";
const CACHE_TIME_KEY = "bh_discount_brands_cache_time";
const CACHE_DURATION = 10 * 60 * 1000;

const priceInput = document.getElementById("price");
const brandsContainer = document.getElementById("brands");
const resultEl = document.getElementById("result");

let selectedDiscount = 0;

function getCachedBrands() {
  try {
    const cachedBrands = localStorage.getItem(CACHE_KEY);
    if (!cachedBrands) return null;

    return JSON.parse(cachedBrands);
  } catch {
    return null;
  }
}

function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
}

function isCacheFresh() {
  const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY));
  if (!cachedTime) return false;

  return Date.now() - cachedTime < CACHE_DURATION;
}

async function loadBrands() {
  const cachedBrands = getCachedBrands();

  if (cachedBrands && cachedBrands.length) {
    renderBrands(cachedBrands);

    if (isCacheFresh()) return;
  }

  try {
    const response = await fetch(API, {
      cache: "no-store"
    });

    const data = await response.json();

    if (data && data.length) {
      saveCache(data);
      renderBrands(data);
    }
  } catch (error) {
    console.error(error);
  }
}

function renderBrands(data) {
  brandsContainer.innerHTML = data.map(brand => {
    const discount = Number(brand.discount);

    return `
      <button class="brand-btn" data-discount="${discount}">
        <span class="brand-name">${brand.name}</span>
        <span class="brand-discount">-${Math.round(discount)}%</span>
      </button>
    `;
  }).join("");

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

document.addEventListener("gesturestart", function (event) {
  event.preventDefault();
});

loadBrands();
