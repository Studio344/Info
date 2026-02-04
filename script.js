document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Mouse Tracking for Spotlight Effects ---
  const body = document.body;
  
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Set custom properties for CSS to use
    body.style.setProperty("--mouse-x", `${x}px`);
    body.style.setProperty("--mouse-y", `${y}px`);
  });

  // --- 2. Typing Animation ---
  const text = "Engineer / Rookie Dad";
  const typingTarget = document.getElementById("typing");
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

  // --- 3. Projects Loading ---
  fetch("projects.json")
    .then((res) => res.json())
    .then((projects) => {
      const container = document.getElementById("projects-wrapper");
      container.innerHTML = ""; // Clear whitespace/comments to prevent layout glitches
      
      projects.forEach((project, i) => {
        const card = document.createElement("div");
        card.className = "bento-card project-card"; // Apply bento styling
        
        // Add staggered animation delay if needed
        card.style.animationDelay = `${i * 0.1}s`;

        // Determine visual style based on title (or add a field in json in future)
        let visualClass = "visual-portfolio"; // default
        let iconSvg = "";
        
        if (project.title === "UCFitness") {
            visualClass = "visual-ucfitness";
            // Activity / Pulse Icon
            iconSvg = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
        } else if (project.title === "Portfolio") {
            visualClass = "visual-portfolio";
            // Code / Bracket Icon
            iconSvg = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
        }

        card.innerHTML = `
          <div class="card-visual-header ${visualClass}">
            <div class="card-visual-pattern"></div>
            <div class="card-visual-icon">${iconSvg}</div>
          </div>
          <div class="card-content-body">
            <div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
            <a href="${project.link}" target="_blank" style="margin-top: 1rem; align-self: flex-start;">View Project &rarr;</a>
          </div>
        `;
        container.appendChild(card);
      });

      // Animate entry with GSAP
      gsap.from(".bento-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });

      // --- Reliable Height Equalizer for About & Projects ---
      function equalizeHeights() {
        const aboutCard = document.querySelector(".about-card");
        const projectCards = document.querySelectorAll(".project-card");
        
        // Critical safety check
        if (!aboutCard || projectCards.length === 0) return;
        
        // Temporarily reset height to auto to read natural content height
        // We use requestAnimationFrame to avoid layout thrashing loop if called frequently
        requestAnimationFrame(() => {
          aboutCard.style.height = "auto";
          projectCards.forEach(c => c.style.height = "auto");

          let maxHeight = aboutCard.offsetHeight;
          projectCards.forEach(c => {
            maxHeight = Math.max(maxHeight, c.offsetHeight);
          });

          aboutCard.style.height = `${maxHeight}px`;
          projectCards.forEach(c => c.style.height = `${maxHeight}px`);
        });
      }

      // 1. Initial Call
      equalizeHeights();

      // 2. Wait for fonts (often changes text wrap/height)
      document.fonts.ready.then(equalizeHeights);

      // 3. ResizeObserver: watches for any size change on the parent wrapper or window
      const resizeObserver = new ResizeObserver(() => {
        equalizeHeights();
      });
      
      // Observe the container (if it changes width, text wraps, height changes)
      resizeObserver.observe(container);
      resizeObserver.observe(document.body); // Fallback for window resize

      // 4. Window Resize (Legacy fallback)
      window.addEventListener("resize", equalizeHeights);
    });

  // --- 4. Language Toggle ---
  const langToggle = document.getElementById("lang-toggle");
  let currentLang = "ja";
  
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      currentLang = currentLang === "ja" ? "en" : "ja";
      langToggle.textContent = currentLang === "ja" ? "EN" : "JP";
      i18next.changeLanguage(currentLang);
    });
  }
  
  // Particles removed in favor of CSS Noise/Spotlight
});
