// i18n.js
i18next.use(i18nextHttpBackend).init(
  {
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

        // DEV-08: ルートからの相対パスを動的に算出（/projects/ 以外のサブディレクトリにも対応）
        let prefix = "";
        // カスタムドメインの場合: /projects/xxx.html → depth=2
        // GitHub Pages (user.github.io/repo/) の場合: /repo/projects/xxx.html → depth=3
        const segments = path
          .split("/")
          .filter((s) => s.length > 0 && s.endsWith(".html") === false);
        // 最後のセグメントがHTMLファイル名でない場合のみ考慮
        if (segments.length > 0) {
          // GitHubPagesのリポジトリプレフィックスを検出
          const isGhPages =
            !window.location.hostname.includes(".") ||
            window.location.hostname.endsWith(".github.io");
          const baseSegments = isGhPages ? 1 : 0; // github.io/repo/ = 1 base segment
          const extraDepth = segments.length - baseSegments;
          if (extraDepth > 0) {
            prefix = "../".repeat(extraDepth);
          }
        }

        // If testing locally (npx serve .), root is /
        // If on GH Pages (studio344.net), root is / (if custom domain)
        // If on GH Pages (user.github.io/Info), root is /Info/

        // Let's assume locales is always at the same level as i18n.js (root of app)
        // If i18n.js is loaded via src="../i18n.js" then locales is at "../locales"

        return `${prefix}locales/${lng}.json`;
      },
    },
    // host on github pages under /Info/, so we might need relative path or absolute path
    // For local dev with `npx serve .`, it is root.
    // To support both, we can try relative path: './locales/{{lng}}.json' if script is in root.
    // But i18n.js is in root.
  },
  function (err, t) {
    if (err) return console.error(err);
    updateContent();
  },
);

i18next.on("languageChanged", (lng) => {
  // HTMLのlang属性を更新 (SEO + スクリーンリーダー対応)
  document.documentElement.lang = lng.substring(0, 2);
  updateContent();
});

function updateContent() {
  // 許可タグリスト（翻訳テキスト用の軽量サニタイザー）
  const ALLOWED_TAGS = /^(br|strong|em|a|span|b|i)$/i;

  function sanitizeTranslation(html) {
    // 許可リスト外のHTMLタグを除去する
    return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
      return ALLOWED_TAGS.test(tag) ? match : "";
    });
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = i18next.t(key);
    // If content has <br> or HTML tags, use innerHTML with sanitization, otherwise textContent
    if (value.includes("<") && value.includes(">")) {
      el.innerHTML = sanitizeTranslation(value);
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
    const langLabel = langToggle.querySelector(".lang-label");
    const labelTarget = langLabel || langToggle;
    labelTarget.textContent = currentLang === "ja" ? "EN" : "JP";
    langToggle.setAttribute(
      "aria-label",
      currentLang === "ja" ? "Switch to English" : "日本語に切り替え",
    );

    langToggle.addEventListener("click", () => {
      const newLang = i18next.language === "ja" ? "en" : "ja";
      i18next.changeLanguage(newLang);
      labelTarget.textContent = newLang === "ja" ? "EN" : "JP";
      langToggle.setAttribute(
        "aria-label",
        newLang === "ja" ? "Switch to English" : "日本語に切り替え",
      );
    });
  }

  // --- ハンバーガーメニューのトグルロジック ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".nav-menu-overlay");

  // ハンバーガーアイコン SVG
  const ICON_HAMBURGER =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  const ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  if (hamburger && navMenu) {
    /**
     * メニューを閉じる共通関数
     */
    function closeMenu() {
      navMenu.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      document.body.classList.remove("menu-open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.innerHTML = ICON_HAMBURGER;
      hamburger.focus(); // フォーカスをトリガーに戻す
    }

    /**
     * メニューを開く共通関数
     */
    function openMenu() {
      navMenu.classList.add("open");
      if (overlay) overlay.classList.add("open");
      document.body.classList.add("menu-open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.innerHTML = ICON_CLOSE;
      // メニュー内の最初のリンクにフォーカスを移す
      const firstLink = navMenu.querySelector(".nav-btn");
      if (firstLink) firstLink.focus();
    }

    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Escape キーでメニューを閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        closeMenu();
      }
    });

    // フォーカストラップ: メニューが開いている間、Tab キーをメニュー内に閉じ込める
    navMenu.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !navMenu.classList.contains("open")) return;

      const focusableEls = navMenu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: 最初の要素からハンバーガーボタンへ → メニュー末尾にループ
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: 最後の要素から → メニュー先頭にループ
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });

    // オーバーレイクリックでメニューを閉じる
    if (overlay) {
      overlay.addEventListener("click", closeMenu);
    }

    // ナビリンクをクリックしたときにメニューを閉じる
    navMenu.querySelectorAll(".nav-btn").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.id === "lang-toggle") return; // 言語切替は閉じない
        closeMenu();
      });
    });
  }
});
