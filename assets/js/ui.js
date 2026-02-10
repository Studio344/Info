/**
 * ui.js
 * Common UI interactions and effects for Studio344
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Mouse Tracking for Spotlight Effects ---
  const body = document.body;

  // Update CSS variables for mouse position
  // This allows CSS radial-gradients to follow the mouse
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Set custom properties on body (or documentElement for broader support)
    document.documentElement.style.setProperty("--mouse-x", `${x}px`);
    document.documentElement.style.setProperty("--mouse-y", `${y}px`);
  });


  // --- 2. Typing Animation (多言語対応) ---
  const typingTarget = document.getElementById("typing");
  if (typingTarget) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 言語に応じたテキストを選択
    function getTypingText() {
      const lang = (typeof i18next !== 'undefined' && i18next.language) ? i18next.language.substring(0, 2) : 'ja';
      return lang === 'en' ? 'Engineer / Rookie Dad' : 'Engineer / 新米パパ';
    }

    function runTyping() {
      const text = getTypingText();
      if (prefersReducedMotion) {
        typingTarget.textContent = text;
      } else {
        typingTarget.textContent = '';
        let index = 0;
        function typeWriter() {
          if (index < text.length) {
            typingTarget.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 80);
          }
        }
        setTimeout(typeWriter, 1000);
      }
    }

    runTyping();

    // 言語切替え時に再実行
    if (typeof i18next !== 'undefined') {
      i18next.on('languageChanged', () => {
        typingTarget.textContent = getTypingText();
      });
    }
  }

  // --- 3. 3D Tilt Effect (現在無効) ---
  window.initTilt = () => {
    // 将来的にGSAPベースのチルトエフェクトを再実装予定
  };

  // --- 4. Dynamic Copyright ---
  const copyrightYear = document.getElementById("copyright-year");
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // --- 5. Active Link Highlighting ---
  const currentPath = window.location.pathname;
  const page = currentPath.split("/").pop() || "index.html";

  // Select both desktop (.nav-menu) and mobile (.nav-links - if exists, but structure seems to use nav-menu)
  const navLinks = document.querySelectorAll(".nav-menu a, .nav-links a");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Normalize logic
    let isActive = false;

    // 1. Exact filename match (e.g. "about.html")
    if (href === page || (page === "" && href === "index.html")) {
      isActive = true;
    }

    // 2. Subdirectory handling for Projects
    // If current path contains "/projects/" and link is "projects.html" or "../projects.html"
    if (currentPath.includes("/projects/") && (href.includes("projects.html") || href === "../projects.html")) {
      isActive = true;
    }

    // 3. Handle relative paths from subdirectories (e.g. "../about.html" should match "about.html")
    if (href.startsWith("../") && href.includes(page)) {
      isActive = true;
    }

    if (isActive) {
      link.classList.add("active");
    }
  });

  // Run initially for static content
  // initTilt();
});
