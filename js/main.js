let currentLang = "fa";
let currentTheme = "light";
let currentCategoryIndex = 0;
let searchQuery = "";

const categoryListEl = document.getElementById("categoryList");
const contentArea = document.getElementById("contentArea");
const langToggleBtn = document.getElementById("langToggle");
const themeToggleBtn = document.getElementById("themeToggle");
const sidebarTitleSpan = document.getElementById("sidebarTitle");
const subtitleSpan = document.getElementById("subtitle");
const langTextSpan = document.getElementById("langText");
const themeTextSpan = document.getElementById("themeText");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

let overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

function renderSidebar() {
categoryListEl.innerHTML = "";
categoriesData.forEach((cat, idx) => {
const li = document.createElement("li");
li.className = "category-item";
if (idx === currentCategoryIndex) li.classList.add("active");
const icon = document.createElement("i");
icon.className = "fas fa-folder-open";
li.appendChild(icon);
const text = document.createTextNode(currentLang === "fa" ? cat.fa : cat.en);
li.appendChild(text);
li.addEventListener("click", () => {
currentCategoryIndex = idx;
renderSidebar();
renderContent();
if (window.innerWidth <= 768) {
sidebar.classList.remove("open");
overlay.classList.remove("show");
}
});
categoryListEl.appendChild(li);
});
}

function renderContent() {
const cat = categoriesData[currentCategoryIndex];
if (!cat) {
contentArea.innerHTML = '<div class="empty">دسته‌ای یافت نشد</div>';
return;
}
let items = cat.items;
if (searchQuery.trim() !== "") {
const q = searchQuery.trim().toLowerCase();
items = items.filter(item => item.name.toLowerCase().includes(q) || (currentLang === "fa" ? item.descFa : item.descEn).toLowerCase().includes(q));
}
const title = currentLang === "fa" ? cat.fa : cat.en;
let html = `<h2 class="category-title">${title}</h2>`;
if (items.length === 0) {
html += `<div class="empty">کتابخانه‌ای یافت نشد</div>`;
} else {
html += `<div class="library-grid">`;
items.forEach(item => {
const desc = currentLang === "fa" ? item.descFa : item.descEn;
let shortDesc = desc;
if (desc.length > 200 && window.innerWidth <= 768) {
shortDesc = desc.substring(0, 150) + "...";
}
html += `
<div class="library-card">
<div class="library-name"><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name} <i class="fas fa-external-link-alt" style="font-size:0.65rem"></i></a></div>
<div class="library-desc">${shortDesc}</div>
</div>
`;
});
html += `</div>`;
}
contentArea.innerHTML = html;
}

function updateUIStrings() {
sidebarTitleSpan.innerText = currentLang === "fa" ? "دسته‌بندی‌ها" : "Categories";
subtitleSpan.innerText = currentLang === "fa" ? "مجموعه‌ای از بهترین کتابخانه‌های روبی" : "A curated collection of awesome Ruby libraries";
langTextSpan.innerText = currentLang === "fa" ? "English" : "فارسی";
document.querySelector(".title h1").innerText = "Awesome Ruby";
document.body.classList.remove("fa-lang", "en-lang");
document.body.classList.add(currentLang === "fa" ? "fa-lang" : "en-lang");
if (window.innerWidth <= 768) {
sidebar.classList.remove("open");
overlay.classList.remove("show");
}
renderSidebar();
renderContent();
}

function toggleLang() {
currentLang = currentLang === "fa" ? "en" : "fa";
updateUIStrings();
}

function toggleTheme() {
currentTheme = currentTheme === "light" ? "dark" : "light";
document.body.classList.toggle("dark", currentTheme === "dark");
themeTextSpan.innerText = (currentLang === "fa" ? (currentTheme === "dark" ? "روشن" : "تاریک") : (currentTheme === "dark" ? "Light" : "Dark"));
localStorage.setItem("awesome-ruby-theme", currentTheme);
}

function loadTheme() {
const saved = localStorage.getItem("awesome-ruby-theme");
if (saved === "dark") {
currentTheme = "dark";
document.body.classList.add("dark");
} else {
currentTheme = "light";
document.body.classList.remove("dark");
}
themeTextSpan.innerText = (currentLang === "fa" ? (currentTheme === "dark" ? "روشن" : "تاریک") : (currentTheme === "dark" ? "Light" : "Dark"));
}

function openSidebar() {
sidebar.classList.add("open");
overlay.classList.add("show");
}

function closeSidebar() {
sidebar.classList.remove("open");
overlay.classList.remove("show");
}

if (menuToggle) {
menuToggle.addEventListener("click", (e) => {
e.stopPropagation();
if (sidebar.classList.contains("open")) {
closeSidebar();
} else {
openSidebar();
}
});
}

overlay.addEventListener("click", closeSidebar);

window.addEventListener("resize", function() {
if (window.innerWidth > 768) {
closeSidebar();
renderContent();
} else {
renderContent();
}
});

loadTheme();
updateUIStrings();
renderContent();
langToggleBtn.addEventListener("click", toggleLang);
themeToggleBtn.addEventListener("click", toggleTheme);
