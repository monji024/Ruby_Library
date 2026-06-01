let currentLang = "fa";
let currentCategoryIndex = null;
let searchQuery = "";

const categoryListEl = document.getElementById("categoryList");
const contentArea = document.getElementById("contentArea");
const langToggleBtn = document.getElementById("langToggle");
const themeToggleBtn = document.getElementById("themeToggle");
const sidebarTitleSpan = document.getElementById("sidebarTitle");
const subtitleSpan = document.getElementById("subtitle");
const langTextSpan = document.getElementById("langText");
const themeTextSpan = document.getElementById("themeText");
const themeIcon = document.getElementById("themeIcon");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const homeButton = document.getElementById("homeButton");
const searchInput = document.getElementById("searchInput");
const overlay = document.getElementById("overlay");

function showWelcomeScreen() {
    const isFa = currentLang === "fa";
    contentArea.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-icon"><i class="fas fa-gem"></i></div>
            <h2 class="welcome-title">${isFa ? "به Library Ruby خوش آمدی" : "Welcome to Library Ruby"}</h2>
            <p class="welcome-desc">${isFa ? ":) بهترین کتابخونه های روبی رو اینجا پیدا کن" : "Find the best Ruby libraries here :)"}</p>
            <div class="welcome-tip">
                <p><i class="fas ${isFa ? 'fa-arrow-left' : 'fa-arrow-right'}"></i> ${isFa ? "از منوی چپ دسته رو انتخاب کن" : "Select a category from the menu"}</p>
            </div>
        </div>
    `;
}

function getAllResultsFromSearch() {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    const allResults = [];
    
    categoriesData.forEach(cat => {
        const matchedItems = [];
        cat.items.forEach(item => {
            const nameMatch = item.name.toLowerCase().includes(q);
            const descEnMatch = item.descEn.toLowerCase().includes(q);
            const descFaMatch = item.descFa.toLowerCase().includes(q);
            const descMatch = currentLang === "fa" ? descFaMatch : descEnMatch;
            
            if (nameMatch || descMatch) {
                let score = 0;
                if (item.name.toLowerCase() === q) score = 100;
                else if (item.name.toLowerCase().startsWith(q)) score = 90;
                else if (item.name.toLowerCase().includes(q)) score = 80;
                else if (descMatch) score = 50;
                matchedItems.push({ ...item, score });
            }
        });
        if (matchedItems.length > 0) {
            matchedItems.sort((a, b) => b.score - a.score);
            allResults.push({
                categoryEn: cat.en,
                categoryFa: cat.fa,
                items: matchedItems
            });
        }
    });
    return allResults;
}

function renderSearchResults() {
    const results = getAllResultsFromSearch();
    if (!results || results.length === 0) {
        contentArea.innerHTML = `<div class="empty">${currentLang === "fa" ? "نتیجه‌ای یافت نشد" : "No results found"}</div>`;
        return;
    }
    
    let totalItems = 0;
    results.forEach(r => totalItems += r.items.length);
    let html = `<h2 class="category-title">${currentLang === "fa" ? `🔍 نتایج جستجو (${totalItems})` : `🔍 Search Results (${totalItems})`}</h2>`;
    
    results.forEach(result => {
        const catTitle = currentLang === "fa" ? result.categoryFa : result.categoryEn;
        html += `<div style="margin-top: 1.2rem;"><h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1rem;"><i class="fas fa-folder-open"></i> ${catTitle}</h3>`;
        html += `<div class="library-grid">`;
        result.items.forEach(item => {
            const desc = currentLang === "fa" ? item.descFa : item.descEn;
            let shortDesc = desc.length > 150 ? desc.substring(0, 150) + "..." : desc;
            html += `
                <div class="library-card ${item.score === 100 ? 'exact-match' : ''}">
                    <div class="library-name"><a href="${item.url}" target="_blank">${item.name} <i class="fas fa-external-link-alt"></i></a></div>
                    <div class="library-desc">${shortDesc}</div>
                </div>
            `;
        });
        html += `</div></div>`;
    });
    contentArea.innerHTML = html;
}

function renderSidebar() {
    categoryListEl.innerHTML = "";
    categoriesData.forEach((cat, idx) => {
        const li = document.createElement("li");
        li.className = "category-item";
        if (idx === currentCategoryIndex) li.classList.add("active");
        const icon = document.createElement("i");
        icon.className = "fas fa-folder-open";
        li.appendChild(icon);
        li.appendChild(document.createTextNode(currentLang === "fa" ? cat.fa : cat.en));
        li.addEventListener("click", () => {
            currentCategoryIndex = idx;
            if (searchInput) searchInput.value = "";
            searchQuery = "";
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
    if (searchQuery.trim() !== "") {
        renderSearchResults();
        return;
    }
    if (currentCategoryIndex === null || !categoriesData[currentCategoryIndex]) {
        showWelcomeScreen();
        return;
    }
    const cat = categoriesData[currentCategoryIndex];
    const title = currentLang === "fa" ? cat.fa : cat.en;
    let html = `<h2 class="category-title">${title}</h2><div class="library-grid">`;
    cat.items.forEach(item => {
        const desc = currentLang === "fa" ? item.descFa : item.descEn;
        let shortDesc = desc.length > 180 ? desc.substring(0, 180) + "..." : desc;
        html += `
            <div class="library-card">
                <div class="library-name"><a href="${item.url}" target="_blank">${item.name} <i class="fas fa-external-link-alt"></i></a></div>
                <div class="library-desc">${shortDesc}</div>
            </div>
        `;
    });
    html += `</div>`;
    contentArea.innerHTML = html;
}

function updateUIStrings() {
    const isFa = currentLang === "fa";
    sidebarTitleSpan.innerText = isFa ? "دسته‌بندی‌ها" : "Categories";
    subtitleSpan.innerText = isFa ? "کتابخانه کامل منابع روبی" : "Complete Ruby Library";
    langTextSpan.innerText = isFa ? "English" : "فارسی";
    if (searchInput) searchInput.placeholder = isFa ? "جستجو..." : "Search...";
    document.body.classList.remove("fa-lang", "en-lang");
    document.body.classList.add(isFa ? "fa-lang" : "en-lang");
    renderSidebar();
    renderContent();
}

function toggleLang() {
    currentLang = currentLang === "fa" ? "en" : "fa";
    updateUIStrings();
    setTheme(document.body.classList.contains("dark") ? "dark" : "light");
}

function setTheme(theme) {
    const isFa = currentLang === "fa";
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeTextSpan.innerText = isFa ? "روشن" : "Light";
        themeIcon.className = "fas fa-sun";
        localStorage.setItem("awesome-ruby-theme", "dark");
    } else {
        document.body.classList.remove("dark");
        themeTextSpan.innerText = isFa ? "تاریک" : "Dark";
        themeIcon.className = "fas fa-moon";
        localStorage.setItem("awesome-ruby-theme", "light");
    }
}

function toggleTheme() {
    setTheme(document.body.classList.contains("dark") ? "light" : "dark");
}

function loadTheme() {
    const saved = localStorage.getItem("awesome-ruby-theme");
    setTheme(saved === "dark" ? "dark" : "light");
}

function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
}

function goHome() {
    currentCategoryIndex = null;
    if (searchInput) searchInput.value = "";
    searchQuery = "";
    renderSidebar();
    renderContent();
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }
}

function handleSearch() {
    searchQuery = searchInput ? searchInput.value : "";
    renderContent();
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

if (overlay) {
    overlay.addEventListener("click", closeSidebar);
}

if (homeButton) {
    homeButton.addEventListener("click", goHome);
}

if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
}

window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});

loadTheme();
updateUIStrings();
langToggleBtn.addEventListener("click", toggleLang);
themeToggleBtn.addEventListener("click", toggleTheme);
