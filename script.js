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

  // Blog Posts: assets/posts/list.jsonからカウント
  if (statPosts) {
    fetch("assets/posts/list.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        statPosts.textContent = data.length;
      })
      .catch((err) => {
        console.error('ブログ記事数の取得に失敗:', err.message);
        statPosts.textContent = "-";
      });
  }

  // --- Projects Loading (統合: カウント + カード描画を1回のfetchで実行) ---
  fetch("projects.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      // プロジェクト数のスタットを更新（Coming Soonを除外）
      if (statProjects) {
        const publishedCount = projects.filter((p) => !p.comingSoon).length;
        statProjects.textContent = publishedCount;
      }
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
            if (project.comingSoon) {
              linkEl.removeAttribute("href");
              linkEl.classList.add("disabled");
              linkEl.textContent =
                lang === "ja" ? "準備中…" : "Coming Soon…";
              linkEl.setAttribute("aria-disabled", "true");
              card.classList.add("coming-soon");
            } else {
              linkEl.href = project.link;
              linkEl.textContent = viewText;
            }
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

      // --- ホームページ: Featured Projects セクション ---
      const homeFeatured = document.getElementById("home-featured-projects");
      if (homeFeatured && template) {
        const featured = projects.filter((p) => !p.comingSoon).slice(0, 2);
        function renderHomeFeatured() {
          const lang = typeof i18next !== "undefined" && i18next.language ? i18next.language : "ja";
          const viewText = typeof i18next !== "undefined" ? i18next.t("projects_page.view_project") : "詳細を見る →";
          homeFeatured.innerHTML = "";
          featured.forEach((project) => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector(".project-card");
            const visualClass = project.visualClass || "visual-portfolio";
            const iconSvg = iconMap[project.icon] || iconMap["code"];
            card.querySelector(".card-visual-header").classList.add(visualClass);
            card.querySelector(".card-visual-icon").innerHTML = iconSvg;
            const title = lang === "ja" && project.title_ja ? project.title_ja : project.title;
            const desc = lang === "ja" && project.description_ja ? project.description_ja : project.description;
            const titleEl = card.querySelector("h3");
            if (titleEl) titleEl.textContent = title;
            const descEl = card.querySelector("p");
            if (descEl) descEl.textContent = desc;
            const linkEl = card.querySelector("a");
            if (linkEl) { linkEl.href = project.link; linkEl.textContent = viewText; }
            homeFeatured.appendChild(clone);
          });
        }
        renderHomeFeatured();
        if (typeof i18next !== "undefined") {
          i18next.on("languageChanged", renderHomeFeatured);
        }
      }
    });

  // --- ホームページ: Latest Blog セクション ---
  const homeBlog = document.getElementById("home-latest-blog");
  if (homeBlog) {
    fetch("assets/posts/list.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(async (posts) => {
        const latest = posts.slice(0, 3);

        // マークダウンからタイトルを抽出するヘルパー
        function extractTitle(mdText) {
          const match = mdText.match(/^#\s+(.+)$/m);
          return match ? match[1].trim() : "Untitled";
        }

        // 各言語のタイトルを事前に取得
        async function loadTitles(lang) {
          const titles = {};
          await Promise.all(latest.map(async (post) => {
            try {
              const res = await fetch(`assets/posts/${post.baseFilename}.${lang}.md`);
              if (res.ok) {
                const md = await res.text();
                titles[post.id] = extractTitle(md);
              }
            } catch (e) { /* ignore */ }
          }));
          return titles;
        }

        // 初期ロード: 両言語を並列取得
        const [titlesJa, titlesEn] = await Promise.all([loadTitles("ja"), loadTitles("en")]);

        function renderHomeBlog() {
          const lang = typeof i18next !== "undefined" && i18next.language ? i18next.language : "ja";
          const titles = lang === "ja" ? titlesJa : titlesEn;
          homeBlog.innerHTML = "";
          latest.forEach((post) => {
            const title = titles[post.id] || post.id;
            const card = document.createElement("a");
            card.href = `blog.html#post/${post.id}`;
            card.className = "home-blog-card";
            card.innerHTML = `
              <span class="home-blog-emoji">${post.emoji || "📝"}</span>
              <span class="home-blog-date">${post.date}</span>
              <span class="home-blog-title">${title}</span>
              <span class="home-blog-tags">${(post.tags || []).slice(0, 2).map(t => `<span class="blog-preview-tag">${t}</span>`).join("")}</span>
            `;
            homeBlog.appendChild(card);
          });
        }
        renderHomeBlog();
        if (typeof i18next !== "undefined") {
          i18next.on("languageChanged", renderHomeBlog);
        }
      })
      .catch((err) => {
        console.error('最新ブログの取得に失敗:', err.message);
        if (homeBlog) homeBlog.innerHTML = '<p style="color: var(--text-secondary);">Failed to load posts.</p>';
      });
  }
});
