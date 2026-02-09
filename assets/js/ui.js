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
    const text = "Engineer / Rookie Dad";
    let index = 0;

    function typeWriter() {
      if (index < text.length) {
        typingTarget.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 80);
      }
    }

    // Start slightly delayed
    setTimeout(typeWriter, 1000);
  }

  // --- 3. 3D Tilt Effect ---
  // Exposed globally so script.js can call it after loading dynamic content
  window.initTilt = () => {
    /*
    // Disabled by user request (Phase 2 reverted)
    const cards = document.querySelectorAll(".bento-card");
    const maxRotate = 2; // degrees

    cards.forEach(card => {
      // Avoid double-binding
      if (card.dataset.tiltInitialized) return;
      card.dataset.tiltInitialized = "true";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Mouse relative to card center
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation
        // Rotate X (up/down tilt) depends on Y position (if mouse is top, tilt up)
        // If mouse is at top (negative Y), we want positive RotateX? No, standard CSS rotateX:
        // Positive rotateX tips the top away (bottom towards viewer).
        // Negative rotateX tips the top towards viewer.
        // So if mouse is top (negative Y), we want negative rotateX.
        const rotateX = (mouseY / (rect.height / 2)) * -maxRotate;
        const rotateY = (mouseX / (rect.width / 2)) * maxRotate;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;

        // Optional: Update internal glare if we want specific glare logic here
        // But styles.css handles glare via mouse-x/y on body, so it works globally.
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
    */
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
  // initTilt(); // Disabled by user request
});
