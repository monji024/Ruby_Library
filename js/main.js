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

let overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

let scrollTimeout = null;
window.addEventListener("scroll", function() {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    document.body.style.pointerEvents = "none";
    scrollTimeout = setTimeout(function() {
        document.body.style.pointerEvents = "";
    }, 100);
});

function showMobileTip() {
    if (window.innerWidth <= 768 && !localStorage.getItem("mobileTipShown")) {
        const tip = document.createElement("div");
        tip.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--primary);color:white;padding:8px 16px;border-radius:40px;font-size:12px;z-index:1001;animation:fadeUp 0.3s;box-shadow:0 4px 12px rgba(0,0,0,0.2);";
        tip.innerHTML = currentLang === "fa" ? "منو رو از این دکمه باز کن ☰" : "Open menu with this button ☰";
        document.body.appendChild(tip);
        localStorage.setItem("mobileTipShown", "true");
        setTimeout(() => {
            tip.style.opacity = "0";
            setTimeout(() => tip.remove(), 500);
        }, 4000);
    }
}

function showWelcomeScreen() {
    const isFa = currentLang === "fa";
    const welcomeHtml = `
        <div class="welcome-screen">
            <div class="welcome-icon"><i class="fas fa-gem"></i></div>
            <h2 class="welcome-title">${isFa ? "به Library Ruby خوش آمدی" : "Welcome to Library Ruby"}</h2>
            <p class="welcome-desc">${isFa ? "یه جایزه کامل از بهترین کتابخانه‌های روبی:) اینجا میتونی هر کتابخونه‌ای که برای پروژه‌ات نیاز داری پیدا کنی." : "A complete collection of the best Ruby libraries:) Here you can find any library you need for your project."}</p>
            <div class="welcome-tip">
                <p><i class="fas ${isFa ? 'fa-arrow-left' : 'fa-arrow-right'}"></i> ${isFa ? "از منوی سمت راست، دسته‌بندی مورد نظرتو انتخاب کن" : "Select a category from the menu on the right"}</p>
            </div>
        </div>
    `;
    contentArea.innerHTML = welcomeHtml;
}

function getAllResultsFromSearch() {
    if (!searchQuery.trim()) return null;
    
    const q = searchQuery.trim().toLowerCase();
    const allResults = [];
    
    categoriesData.forEach(cat => {
        const matchedItems = [];
        
        cat.items.forEach(item => {
            const nameMatch = item.name.toLowerCase().includes(q);
            const descMatch = (currentLang === "fa" ? item.descFa : item.descEn).toLowerCase().includes(q);
            
            if (nameMatch || descMatch) {
                let score = 0;
                if (item.name.toLowerCase() === q) {
                    score = 100;
                } else if (item.name.toLowerCase().startsWith(q)) {
                    score = 90;
                } else if (item.name.toLowerCase().includes(q)) {
                    score = 80;
                } else if (descMatch) {
                    score = 50;
                }
                
                matchedItems.push({
                    ...item,
                    score: score,
                    matchType: nameMatch ? "name" : "desc"
                });
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
    
    allResults.sort((a, b) => {
        const aHasExact = a.items.some(i => i.score === 100);
        const bHasExact = b.items.some(i => i.score === 100);
        if (aHasExact && !bHasExact) return -1;
        if (!aHasExact && bHasExact) return 1;
        return 0;
    });
    
    return allResults;
}

function renderSearchResults() {
    const results = getAllResultsFromSearch();
    
    if (!results || results.length === 0) {
        contentArea.innerHTML = `<div class="empty">${currentLang === "fa" ? "کتابخانه‌ای یافت نشد" : "No libraries found"}</div>`;
        return;
    }
    
    let totalItems = 0;
    results.forEach(r => totalItems += r.items.length);
    
    let html = `<h2 class="category-title">${currentLang === "fa" ? `نتایج جستجو برای "${searchQuery}"` : `Search results for "${searchQuery}"`} <span style="font-size:0.8rem; opacity:0.7;">(${totalItems})</span></h2>`;
    
    results.forEach(result => {
        const catTitle = currentLang === "fa" ? result.categoryFa : result.categoryEn;
        html += `<div style="margin-top: 1.5rem;"><h3 style="color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;"><i class="fas fa-folder-open"></i> ${catTitle}</h3>`;
        html += `<div class="library-grid">`;
        
        result.items.forEach((item, idx) => {
            const desc = currentLang === "fa" ? item.descFa : item.descEn;
            let shortDesc = desc;
            if (desc.length > 200 && window.innerWidth <= 768) {
                shortDesc = desc.substring(0, 150) + "...";
            }
            
            let highlightClass = "";
            if (item.score === 100) highlightClass = "exact-match";
            else if (item.score >= 80) highlightClass = "strong-match";
            
            html += `
                <div class="library-card ${highlightClass}" style="animation-delay: ${idx * 0.01}s">
                    <div class="library-name"><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name} <i class="fas fa-external-link-alt" style="font-size:0.65rem"></i></a></div>
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
        const text = document.createTextNode(currentLang === "fa" ? cat.fa : cat.en);
        li.appendChild(text);
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
    if (!cat) {
        showWelcomeScreen();
        return;
    }
    
    let items = cat.items;
    const title = currentLang === "fa" ? cat.fa : cat.en;
    let html = `<h2 class="category-title">${title}</h2>`;
    
    if (items.length === 0) {
        html += `<div class="empty">${currentLang === "fa" ? "کتابخانه‌ای یافت نشد" : "No libraries found"}</div>`;
    } else {
        html += `<div class="library-grid">`;
        items.forEach((item, idx) => {
            const desc = currentLang === "fa" ? item.descFa : item.descEn;
            let shortDesc = desc;
            if (desc.length > 200 && window.innerWidth <= 768) {
                shortDesc = desc.substring(0, 150) + "...";
            }
            html += `
                <div class="library-card" style="animation-delay: ${idx * 0.01}s">
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
    const isFa = currentLang === "fa";
    sidebarTitleSpan.innerText = isFa ? "دسته‌بندی‌ها" : "Categories";
    subtitleSpan.innerText = isFa ? "کتابخانه کامل منابع روبی" : "Complete Ruby resources library";
    langTextSpan.innerText = isFa ? "English" : "فارسی";
    if (searchInput) {
        searchInput.placeholder = isFa ? "جستجوی کتابخانه..." : "Search libraries...";
    }
    document.body.classList.remove("fa-lang", "en-lang");
    document.body.classList.add(isFa ? "fa-lang" : "en-lang");
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
    if (document.body.classList.contains("dark")) {
        setTheme("light");
    } else {
        setTheme("dark");
    }
}

function loadTheme() {
    const saved = localStorage.getItem("awesome-ruby-theme");
    if (saved === "dark") {
        setTheme("dark");
    } else {
        setTheme("light");
    }
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

overlay.addEventListener("click", closeSidebar);
homeButton.addEventListener("click", goHome);
if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
}

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
setTimeout(showMobileTip, 500);
