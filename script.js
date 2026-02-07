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
    if (typingTarget && index < text.length) {
      typingTarget.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, 80);
    }
  }
  // Start slightly delayed only if element exists
  if (typingTarget) {
    setTimeout(typeWriter, 1000);
  }

  // --- Auto-count Stats ---
  const statProjects = document.getElementById("stat-projects-count");
  const statPosts = document.getElementById("stat-posts-count");
  const statTech = document.getElementById("stat-tech-count");

  // Technologies: DOMからバッジ数をカウント
  if (statTech) {
    const badges = document.querySelectorAll(".skill-badge");
    statTech.textContent = badges.length > 0 ? badges.length + "+ tech" : "";
  }

  // Projects: projects.jsonからカウント
  if (statProjects) {
    fetch("projects.json")
      .then((r) => r.json())
      .then((data) => {
        statProjects.textContent = data.length;
      })
      .catch(() => {
        statProjects.textContent = "-";
      });
  }

  // Blog Posts: assets/posts/list.jsonからカウント
  if (statPosts) {
    fetch("assets/posts/list.json")
      .then((r) => r.json())
      .then((data) => {
        statPosts.textContent = data.length;
      })
      .catch(() => {
        statPosts.textContent = "-";
      });
  }

  // --- 3. Projects Loading ---
  fetch("projects.json")
    .then((res) => res.json())
    .then((projects) => {
      const container = document.getElementById("projects-wrapper");

      // アイコンマップ（共通）
      const iconMap = {
        code: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        pulse: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      };

      // 言語対応のプロジェクトカード描画関数
      function renderProjects(animate) {
        if (!container) return;
        const lang =
          typeof i18next !== "undefined" && i18next.language
            ? i18next.language
            : "ja";
        const viewText =
          typeof i18next !== "undefined"
            ? i18next.t("projects_page.view_project")
            : "View Project →";

        container.innerHTML = "";

        projects.forEach((project, i) => {
          const title =
            lang === "ja" && project.title_ja
              ? project.title_ja
              : project.title;
          const desc =
            lang === "ja" && project.description_ja
              ? project.description_ja
              : project.description;

          const card = document.createElement("div");
          card.className = "bento-card project-card";
          card.style.animationDelay = `${i * 0.1}s`;

          const visualClass = project.visualClass || "visual-portfolio";
          const iconSvg = iconMap[project.icon] || iconMap["code"];

          card.innerHTML = `
            <div class="card-visual-header ${visualClass}">
                <div class="card-visual-pattern"></div>
                <div class="card-visual-icon">${iconSvg}</div>
            </div>
            <div class="card-content-body">
                <div>
                    <h3>${title}</h3>
                    <p>${desc}</p>
                </div>
                <a href="${project.link}" style="margin-top: 1rem; align-self: flex-start;">${viewText}</a>
            </div>
            `;
          container.appendChild(card);
        });

        // アニメーション
        if (animate && typeof gsap !== "undefined") {
          gsap.from(".project-card", {
            y: animate === "initial" ? 50 : 30,
            opacity: 0,
            duration: animate === "initial" ? 0.8 : 0.5,
            stagger: animate === "initial" ? 0.1 : 0.08,
            ease: "power3.out",
          });
        }
      }

      // 初回描画
      renderProjects("initial");

      // 言語切替時にプロジェクトカードを再描画
      if (typeof i18next !== "undefined") {
        i18next.on("languageChanged", () => renderProjects("switch"));
      }

      // --- Reliable Height Equalizer for About & Projects ---
      function equalizeHeights() {
        const aboutCard = document.querySelector(".about-card");
        const projectCards = document.querySelectorAll(".project-card");

        // Critical safety check - require BOTH to be present to equalize
        if (!aboutCard || projectCards.length === 0) return;

        // Temporarily reset height to auto to read natural content height
        // We use requestAnimationFrame to avoid layout thrashing loop if called frequently
        requestAnimationFrame(() => {
          aboutCard.style.height = "auto";
          projectCards.forEach((c) => (c.style.height = "auto"));

          let maxHeight = aboutCard.offsetHeight;
          projectCards.forEach((c) => {
            maxHeight = Math.max(maxHeight, c.offsetHeight);
          });

          aboutCard.style.height = `${maxHeight}px`;
          projectCards.forEach((c) => (c.style.height = `${maxHeight}px`));
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
      if (container) {
        resizeObserver.observe(container);
      }
      resizeObserver.observe(document.body); // Fallback for window resize

      // 4. Window Resize (Legacy fallback)
      window.addEventListener("resize", equalizeHeights);
    });

  // --- 4. Language Toggle ---
  // Moved to i18n.js for centralized handling across all pages

  // Particles removed in favor of CSS Noise/Spotlight
});
