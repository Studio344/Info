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

  // --- 5. Active Link: CSS-only (body[data-page] で制御) ---

  // --- 6. 動的ヘッダー (スクロールダウンで非表示、アップで再表示) ---
  const header = document.querySelector(".header");
  if (header) {
    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
      const currentY = window.scrollY;
      if (currentY > 80) {
        header.classList.add("header--scrolled");
        if (currentY > lastScrollY && currentY > 200) {
          header.classList.add("header--hidden");
        } else {
          header.classList.remove("header--hidden");
        }
      } else {
        header.classList.remove("header--scrolled", "header--hidden");
      }
      lastScrollY = currentY;
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // --- 7. Back to Top ボタン ---
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --- 8. スクロールアニメーション (Intersection Observer) ---
  const revealElements = document.querySelectorAll(".scroll-reveal");
  if (revealElements.length > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // reduced-motion: 即時表示
    revealElements.forEach((el) => el.classList.add("revealed"));
  }

  // Run initially for static content
  // initTilt();
});
