// i18n.js
i18next
  .use(i18nextHttpBackend)
  .init({
    lng: "ja",
    fallbackLng: "ja",
    backend: {
      loadPath: (lng, namespace) => {
        // Adjust path based on current location depth
        // Simple check: if we are in /projects/, go up one level.
        const path = window.location.pathname;
        // Check if we are deep in a folder (e.g. /projects/ or /assets/posts/ if that ever happens)
        // This is a naive heuristic but works for current structure
        const depth = (path.match(/\//g) || []).length;
        // Adjust for GitHub Pages which might have a repo prefix
        // If we invoke this from a script, let's try to find the script tag src?
        // No, simpler: check relative path.
        
        let prefix = "";
        if (path.includes("/projects/")) {
            prefix = "../";
        }
        
        // If testing locally (npx serve .), root is /
        // If on GH Pages (studio344.net), root is / (if custom domain)
        // If on GH Pages (user.github.io/Info), root is /Info/
        
        // Let's assume locales is always at the same level as i18n.js (root of app)
        // If i18n.js is loaded via src="../i18n.js" then locales is at "../locales"
        
        return `${prefix}locales/${lng}.json`;
      }
    },
    // host on github pages under /Info/, so we might need relative path or absolute path
    // For local dev with `npx serve .`, it is root.
    // To support both, we can try relative path: './locales/{{lng}}.json' if script is in root.
    // But i18n.js is in root.
  }, function (err, t) {
    if (err) return console.error(err);
    updateContent();
  });

i18next.on("languageChanged", (lng) => {
  // HTMLのlang属性を更新 (SEO + スクリーンリーダー対応)
  document.documentElement.lang = lng.substring(0, 2);
  updateContent();
});

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = i18next.t(key);
    // If content has <br> or HTML tags, use innerHTML, otherwise textContent
    if (value.includes("<") && value.includes(">")) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
}

// --- Language Toggle Logic (Moved from script.js) ---
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  let currentLang = i18next.language || "ja"; // Sync with initialized lang

  if (langToggle) {
    // Initialize button text based on current state
    langToggle.textContent = currentLang === "ja" ? "EN" : "JP";

    langToggle.addEventListener("click", () => {
      const newLang = i18next.language === "ja" ? "en" : "ja";
      i18next.changeLanguage(newLang);
      langToggle.textContent = newLang === "ja" ? "EN" : "JP";
    });
  }

  // --- ハンバーガーメニューのトグルロジック ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".nav-menu-overlay");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
      if (overlay) overlay.classList.toggle("open", isOpen);
      // ハンバーガーアイコンを × に切り替え
      hamburger.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });

    // オーバーレイクリックでメニューを閉じる
    if (overlay) {
      overlay.addEventListener("click", () => {
        navMenu.classList.remove("open");
        overlay.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    }

    // ナビリンクをクリックしたときにメニューを閉じる
    navMenu.querySelectorAll(".nav-btn").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.id === "lang-toggle") return; // 言語切替は閉じない
        navMenu.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }
});
