document.addEventListener("DOMContentLoaded", () => {
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

  // --- Projects Loading ---
  fetch("projects.json")
    .then((res) => res.json())
    .then((projects) => {
      const container = document.getElementById("projects-wrapper");
      const template = document.getElementById("project-card-template");

      // アイコンマップ（共通）
      const iconMap = {
        code: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        pulse: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      };

      // 言語対応のプロジェクトカード描画関数
      function renderProjects(animate) {
        if (!container || !template) return;
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

          // Clone template
          const clone = template.content.cloneNode(true);
          const card = clone.querySelector(".project-card");

          // Set animation delay
          card.style.animationDelay = `${i * 0.1}s`;

          // Visuals
          const visualClass = project.visualClass || "visual-portfolio";
          const iconSvg = iconMap[project.icon] || iconMap["code"];

          card.querySelector(".card-visual-header").classList.add(visualClass);
          card.querySelector(".card-visual-icon").innerHTML = iconSvg;

          // Content
          const titleEl = card.querySelector("h3"); // or .project-title if I added class
          if (titleEl) titleEl.textContent = title;
          else card.querySelector(".project-title").textContent = title;

          const descEl = card.querySelector("p"); // or .project-desc
          if (descEl) descEl.textContent = desc;
          else card.querySelector(".project-desc").textContent = desc;

          const linkEl = card.querySelector("a");
          if (linkEl) {
            linkEl.href = project.link;
            linkEl.textContent = viewText;
          }

          container.appendChild(clone);
        });

        // 3D Tilt 再初期化
        if (typeof window.initTilt === "function") {
          window.initTilt();
        }
      }

      // 初回描画
      renderProjects("initial");

      // 言語切替時にプロジェクトカードを再描画
      if (typeof i18next !== "undefined") {
        i18next.on("languageChanged", () => renderProjects("switch"));
      }
    });
});
