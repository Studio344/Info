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


  // --- 2. Typing Animation ---
  const typingTarget = document.getElementById("typing");
  if (typingTarget) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const typingText = 'Engineer / Rookie Dad';

    function runTyping() {
      if (prefersReducedMotion) {
        typingTarget.textContent = typingText;
      } else {
        typingTarget.textContent = '';
        let index = 0;
        function typeWriter() {
          if (index < typingText.length) {
            typingTarget.textContent += typingText.charAt(index);
            index++;
            setTimeout(typeWriter, 80);
          }
        }
        setTimeout(typeWriter, 1000);
      }
    }

    runTyping();
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

  const navLinks = document.querySelectorAll(".nav-menu a.nav-btn");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href === "#") return;

    // href のファイル名部分を抽出（「../about.html」→「about.html」）
    const hrefFile = href.split("/").pop();

    let isActive = false;

    // 1. ファイル名の完全一致
    if (hrefFile === page) {
      isActive = true;
    }

    // 2. トップページ: pathname が "/" や "" の場合
    if ((page === "" || page === "/" || currentPath === "/") && hrefFile === "index.html") {
      isActive = true;
    }

    // 3. サブディレクトリ（/projects/portfolio.html 等）→ 親カテゴリをハイライト
    if (currentPath.includes("/projects/") && hrefFile === "projects.html") {
      isActive = true;
    }

    if (isActive) {
      link.classList.add("active");
    }
  });

  // Run initially for static content
  // initTilt();
});
