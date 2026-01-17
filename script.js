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
      
      projects.forEach((project, i) => {
        const card = document.createElement("div");
        card.className = "bento-card project-card"; // Apply bento styling
        
        // Add staggered animation delay if needed
        card.style.animationDelay = `${i * 0.1}s`;

        card.innerHTML = `
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.link}" target="_blank">View Project &rarr;</a>
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
