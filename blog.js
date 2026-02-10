document.addEventListener("DOMContentLoaded", () => {
  loadBlogPosts();

  // 言語切替時に再読み込み
  i18next.on("languageChanged", (lng) => {
    loadBlogPosts(lng);
    // 記事表示中なら記事も再読み込み
    if (window.location.hash.startsWith("#post/")) {
      const postId = window.location.hash.replace("#post/", "");
      showSinglePost(postId);
    }
  });

  // ブラウザの「戻る」ボタン対応
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash;
    if (hash.startsWith("#post/")) {
      const postId = hash.replace("#post/", "");
      showSinglePost(postId);
    } else {
      showPostList();
    }
  });

  // 初回読み込み時にハッシュがあれば記事を表示
  if (window.location.hash.startsWith("#post/")) {
    const postId = window.location.hash.replace("#post/", "");
    setTimeout(() => showSinglePost(postId), 300);
  }


});

let currentRequestId = 0;

/**
 * 記事一覧グリッドを表示し、記事ビューを非表示にする
 */
/**
 * 記事一覧グリッドを表示し、記事ビューを非表示にする
 */
function showPostList() {
  const grid = document.getElementById("blog-container");
  const single = document.getElementById("blog-single-view");
  if (grid) grid.style.display = "";
  if (single) single.style.display = "none";
  const title = document.querySelector(".bento-card.text-content-card > h1");
  const desc = document.querySelector(".bento-card.text-content-card > p");
  const controls = document.querySelector(".blog-controls");
  if (title) title.style.display = "";
  if (desc) desc.style.display = "";
  if (controls) controls.style.display = "";
  document.title = "Blog - Studio344";

  // 読書プログレスバーを削除
  removeReadingProgress();

  // Breadcrumbs: List View
  updateBreadcrumbs(null);
}

/**
 * 記事一覧を非表示にし、単一記事を表示する
 */
async function showSinglePost(postId) {
  const grid = document.getElementById("blog-container");
  const single = document.getElementById("blog-single-view");
  const content = document.getElementById("blog-single-content");

  if (!grid || !single || !content) return;

  // グリッドとタイトル・説明文・コントロールを非表示
  grid.style.display = "none";
  const title = document.querySelector(".bento-card.text-content-card > h1");
  const desc = document.querySelector(".bento-card.text-content-card > p");
  const controls = document.querySelector(".blog-controls");
  if (title) title.style.display = "none";
  if (desc) desc.style.display = "none";
  if (controls) controls.style.display = "none";

  // 記事ビューを表示
  single.style.display = "";
  content.innerHTML = '<p style="color: #888;">読み込み中...</p>';

  // スクロール位置をトップに戻す
  window.scrollTo({ top: 0, behavior: "smooth" });

  let rawLang = i18next.language || "ja";
  const currentLang = rawLang.substring(0, 2);

  try {
    const listRes = await fetch("assets/posts/list.json");
    const posts = await listRes.json();
    const post = posts.find((p) => p.id === postId);

    if (!post) {
      content.innerHTML =
        '<p style="color: #888;">記事が見つかりませんでした。</p>';
      return;
    }

    document.title = `${post.id} - Blog - Studio344`;

    // Breadcrumbs: Single Post
    // Note: Titles might be multilingual, for now using ID or fetching title from MD
    // For simplicity/performance, using ID first, will update if title parsing is robust
    updateBreadcrumbs(post.id);

    const filename = `assets/posts/${post.baseFilename}.${currentLang}.md`;
    const mdRes = await fetch(filename);
    if (!mdRes.ok) throw new Error("Markdown not found");
    const mdText = await mdRes.text();

    // Render Markdown
    content.innerHTML = marked.parse(mdText);

    // Breadcrumbs: Update with actual title from MD if available
    const extractedTitle = extractTitle(mdText);
    if (extractedTitle) updateBreadcrumbs(extractedTitle);

    // Syntax Highlighting
    if (window.Prism) {
      window.Prism.highlightAll();
    }

    // タグ表示を挿入（h1の直後）
    insertPostTags(content, post.tags || []);

    // 推定読了時間を挿入
    insertReadingTime(content, mdText);

    // 目次を挿入（タグの後）
    generateTOC(content);

    // コードブロックに言語ラベルを追加
    addCodeLabels(content);

    // コールアウトボックスを変換
    convertCallouts(content);

    // 読書プログレスバーを追加
    initReadingProgress();

  } catch (e) {
    console.error(e);
    content.innerHTML = '<p style="color: #888;">読み込みエラーが発生しました。</p>';
  }
}

/**
 * Generate Table of Contents from h2, h3
 */
function generateTOC(contentElement) {
  const headings = contentElement.querySelectorAll("h2, h3");
  if (headings.length === 0) return;

  const tocContainer = document.createElement("div");
  tocContainer.className = "blog-toc";

  // Header with toggle
  const header = document.createElement("div");
  header.className = "blog-toc-header";

  const tocTitle = i18next.language?.startsWith("en") ? "Table of Contents" : "目次";
  header.innerHTML = `
    <div class="blog-toc-title"><span class="blog-toc-icon">📑</span>${tocTitle}</div>
    <span class="blog-toc-toggle">▶</span>
  `;

  const ul = document.createElement("ul");
  ul.id = "blog-toc-list";
  ul.style.display = "none"; // デフォルトで折りたたみ

  headings.forEach((heading, index) => {
    // Assign ID if missing
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const li = document.createElement("li");
    li.className = `toc-${heading.tagName.toLowerCase()}`;

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;

    // Smooth scroll
    a.onclick = (e) => {
      e.preventDefault();
      document.getElementById(heading.id).scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", `#${heading.id}`);
    };

    li.appendChild(a);
    ul.appendChild(li);
  });

  tocContainer.appendChild(header);
  tocContainer.appendChild(ul);

  // Toggle Logic（折りたたみ / 展開）
  let tocOpen = false;
  header.onclick = () => {
    const list = document.getElementById("blog-toc-list");
    const toggle = tocContainer.querySelector(".blog-toc-toggle");
    tocOpen = !tocOpen;
    if (tocOpen) {
      list.style.display = "block";
      toggle.textContent = "▼";
      tocContainer.classList.add("toc-expanded");
    } else {
      list.style.display = "none";
      toggle.textContent = "▶";
      tocContainer.classList.remove("toc-expanded");
    }
  };

  // Insert TOC after h1 and tags (h1 → tags → TOC → body)
  const h1 = contentElement.querySelector("h1");
  const tagsEl = contentElement.querySelector(".blog-post-tags");
  // 挿入位置: タグがあればその後、なければh1の後、どちらもなければ先頭
  const insertAfter = tagsEl || h1;
  if (insertAfter && insertAfter.nextSibling) {
    contentElement.insertBefore(tocContainer, insertAfter.nextSibling);
  } else if (insertAfter) {
    contentElement.appendChild(tocContainer);
  } else {
    contentElement.insertBefore(tocContainer, contentElement.firstChild);
  }
}

/**
 * 記事のタグをh1の直後に挿入する
 */
function insertPostTags(contentElement, tags) {
  if (!tags || tags.length === 0) return;

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "blog-post-tags";
  tagsDiv.innerHTML = tags
    .map(tag => `<span class="blog-post-tag">${tag}</span>`)
    .join("");

  const h1 = contentElement.querySelector("h1");
  if (h1 && h1.nextSibling) {
    contentElement.insertBefore(tagsDiv, h1.nextSibling);
  } else if (h1) {
    contentElement.appendChild(tagsDiv);
  } else {
    contentElement.insertBefore(tagsDiv, contentElement.firstChild);
  }
}

function updateBreadcrumbs(postTitle) {
  const container = document.getElementById("breadcrumbs");
  const separator = document.getElementById("breadcrumb-separator");
  const current = document.getElementById("breadcrumb-current");
  const blogLink = document.getElementById("breadcrumb-blog");

  if (!container) return;

  container.style.display = "block"; // Always show when enabled

  if (postTitle) {
    // Single Post View
    if (separator) separator.style.display = "inline";
    if (current) {
      current.textContent = postTitle;
      current.style.display = "inline";
    }
    // Make "Blog" clickable to go back
    if (blogLink) {
      blogLink.onclick = (e) => {
        e.preventDefault();
        history.pushState(null, "", "blog.html");
        showPostList();
      };
      blogLink.style.cursor = "pointer";
      blogLink.style.textDecoration = "underline";
    }
  } else {
    // List View
    if (separator) separator.style.display = "none";
    if (current) current.textContent = "";
    // "Blog" is current page, but allow clicking to reset/reload
    if (blogLink) {
      blogLink.onclick = (e) => {
        // e.preventDefault(); // Remove prevention to allow normal navigation or reload
        // Or if we want SPA reset:
        e.preventDefault();
        showPostList();
      };
      blogLink.style.cursor = "pointer";
    }
  }
}

/**
 * Extract the first heading (# ...) from markdown text
 */
function extractTitle(mdText) {
  const match = mdText.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

/**
 * Extract a plain-text excerpt from markdown (skip headings, code blocks, tables)
 */
function extractExcerpt(mdText, maxLength = 70) {
  const lines = mdText.split("\n");
  let excerpt = "";
  let inCodeBlock = false;

  for (const line of lines) {
    // Toggle code block state
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Skip headings, empty lines, tables, images, HTML tags
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("|")) continue;
    if (trimmed.startsWith("![")) continue;
    if (trimmed.startsWith("<")) continue;
    if (trimmed.startsWith("- **") || trimmed.startsWith("- `")) continue;

    // Clean markdown formatting
    let clean = trimmed
      .replace(/\*\*(.+?)\*\*/g, "$1") // bold
      .replace(/\*(.+?)\*/g, "$1") // italic
      .replace(/`(.+?)`/g, "$1") // inline code
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
      .replace(/<br\s*\/?>/g, " ") // line breaks
      .trim();

    if (clean.length > 0) {
      excerpt += (excerpt ? " " : "") + clean;
      if (excerpt.length >= maxLength) break;
    }
  }

  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim() + "…";
  }
  return excerpt;
}

async function loadBlogPosts(langOverride) {
  const listUrl = "assets/posts/list.json";
  const container = document.getElementById("blog-container");

  // Normalize language to 2 characters (e.g., 'en-US' -> 'en')
  let rawLang = langOverride || i18next.language || "ja";
  const currentLang = rawLang.substring(0, 2);

  if (!container) return;

  // Increment request ID to invalidate previous running tasks
  const requestId = ++currentRequestId;

  const readMoreText = currentLang === "ja" ? "続きを読む →" : "Read more →";

  try {
    const response = await fetch(listUrl);
    const posts = await response.json();

    // Check if this is still the latest request
    if (requestId !== currentRequestId) return;

    // Fetch all markdown content first (parallel)
    const postPromises = posts.map(async (post) => {
      const filename = `assets/posts/${post.baseFilename}.${currentLang}.md`;
      try {
        const mdResponse = await fetch(filename);
        if (!mdResponse.ok) return null;
        const mdText = await mdResponse.text();
        return {
          id: post.id,
          date: post.date,
          emoji: post.emoji || "📝",
          tags: post.tags || [],
          title: extractTitle(mdText),
          excerpt: extractExcerpt(mdText),
        };
      } catch (err) {
        console.error(`Failed to load ${filename}`, err);
        return null;
      }
    });

    const loadedPosts = await Promise.all(postPromises);
    const validPosts = loadedPosts.filter(p => p !== null);

    // Check again before DOM manipulation
    if (requestId !== currentRequestId) return;

    // --- Filter Logic Setup ---
    let activeTag = null;
    const tagsContainer = document.getElementById("blog-tags");

    // 1. Generate Tags
    if (tagsContainer) {
      const allTags = new Set();
      validPosts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));

      let tagsHtml = `<button class="filter-tag active" data-tag="all">All</button>`;

      Array.from(allTags).sort().forEach(tag => {
        tagsHtml += `<button class="filter-tag" data-tag="${tag}">${tag}</button>`;
      });
      tagsContainer.innerHTML = tagsHtml;

      // Tag Click Handler
      tagsContainer.querySelectorAll(".filter-tag").forEach(btn => {
        btn.addEventListener("click", (e) => {
          // Update UI
          tagsContainer.querySelectorAll(".filter-tag").forEach(b => {
            b.classList.remove("active");
          });
          e.target.classList.add("active");

          // Update State
          const tag = e.target.dataset.tag;
          activeTag = tag === "all" ? null : tag;
          renderGrid();
        });
      });
    }

    // 2. Render Grid Function
    function renderGrid() {
      container.innerHTML = "";
      const query = "";

      const filtered = validPosts.filter(post => {
        const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
        const matchesSearch = query
          ? post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query)
          : true;
        return matchesTag && matchesSearch;
      });

      if (filtered.length === 0) {
        container.innerHTML = `<p style="color: #666; width: 100%; text-align: center; padding: 2rem;">No posts found.</p>`;
        return;
      }

      filtered.forEach((post, index) => {
        const card = document.createElement("div");
        card.className = "blog-preview-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.style.animationDelay = `${index * 0.05}s`; // Faster stagger for re-renders

        // クリックで記事を表示（SPA方式）
        card.addEventListener("click", () => {
          history.pushState(null, "", `#post/${post.id}`);
          showSinglePost(post.id);
        });

        // キーボードアクセシビリティ
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            history.pushState(null, "", `#post/${post.id}`);
            showSinglePost(post.id);
          }
        });

        const tagsHtml = post.tags
          .map((t) => `<span class="blog-preview-tag">${t}</span>`)
          .join("");

        card.innerHTML = `
                  <div class="blog-preview-accent"></div>
                  <div class="blog-preview-header">
                      <span class="blog-preview-emoji">${post.emoji}</span>
                      <span class="blog-preview-date">${post.date}</span>
                  </div>
                  <h3 class="blog-preview-title">${post.title}</h3>
                  <p class="blog-preview-excerpt">${post.excerpt}</p>
                  <div class="blog-preview-footer">
                      <div class="blog-preview-tags">${tagsHtml}</div>
                      <span class="blog-preview-readmore">${readMoreText}</span>
                  </div>
              `;
        container.appendChild(card);
      });
    }

    // Initial Render
    renderGrid();

  } catch (err) {
    console.error("Error fetching post list:", err);
  }
}

// ============================================================
// 📊 読書プログレスバー
// ============================================================
let _readingProgressHandler = null;

function initReadingProgress() {
  removeReadingProgress(); // 既存を削除

  const bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.id = "reading-progress-bar";
  document.body.appendChild(bar);

  _readingProgressHandler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  };

  window.addEventListener("scroll", _readingProgressHandler, { passive: true });
}

function removeReadingProgress() {
  const existing = document.getElementById("reading-progress-bar");
  if (existing) existing.remove();
  if (_readingProgressHandler) {
    window.removeEventListener("scroll", _readingProgressHandler);
    _readingProgressHandler = null;
  }
}

// ============================================================
// ⏱ 推定読了時間
// ============================================================
function insertReadingTime(contentElement, mdText) {
  // 日本語: 約500文字/分、英語: 約200語/分
  const jaChars = (mdText.match(/[\u3000-\u9fff\uf900-\ufaff]/g) || []).length;
  const enWords = mdText.replace(/[\u3000-\u9fff\uf900-\ufaff]/g, "").split(/\s+/).filter(w => w.length > 0).length;

  const minutes = Math.ceil(jaChars / 500 + enWords / 200);
  const lang = i18next.language?.startsWith("en") ? "en" : "ja";
  const label = lang === "en" ? `${minutes} min read` : `約${minutes}分で読めます`;

  const el = document.createElement("div");
  el.className = "reading-time";
  el.innerHTML = `<span class="reading-time-icon">⏱</span> ${label}`;

  // h1の後、タグの前に挿入
  const tags = contentElement.querySelector(".blog-post-tags");
  const h1 = contentElement.querySelector("h1");
  const insertBefore = tags || (h1 && h1.nextSibling);
  if (insertBefore) {
    contentElement.insertBefore(el, insertBefore);
  } else {
    contentElement.insertBefore(el, contentElement.firstChild);
  }
}

// ============================================================
// 🏷️ コードブロック言語ラベル
// ============================================================
function addCodeLabels(contentElement) {
  const pres = contentElement.querySelectorAll("pre");
  pres.forEach(pre => {
    const code = pre.querySelector("code");
    if (!code) return;

    // Prism adds class like "language-javascript"
    const langClass = Array.from(code.classList).find(c => c.startsWith("language-"));
    if (!langClass) return;

    const lang = langClass.replace("language-", "");
    if (!lang || lang === "none") return;

    // Wrap in container
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";

    const label = document.createElement("span");
    label.className = "code-lang-label";
    label.textContent = lang;

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(label);
    wrapper.appendChild(pre);
  });
}

// ============================================================
// 📦 コールアウトボックス変換
// Markdown内の書式: > [!TYPE] テキスト を検出して変換
// TYPE: info, tip, warning, danger, memo
// ============================================================
function convertCallouts(contentElement) {
  const blockquotes = contentElement.querySelectorAll("blockquote");

  blockquotes.forEach(bq => {
    const firstP = bq.querySelector("p");
    if (!firstP) return;

    const text = firstP.innerHTML;
    // パターン: [!type] で始まる or [!type] Title\n内容
    const match = text.match(/^\[!(info|tip|warning|danger|memo)\]\s*(.*)/is);
    if (!match) return;

    const type = match[1].toLowerCase();
    const rest = match[2];

    const icons = {
      info: "ℹ️",
      tip: "💡",
      warning: "⚠️",
      danger: "🚫",
      memo: "📝",
    };

    // 残りのpを収集
    const allPs = bq.querySelectorAll("p");
    let bodyHtml = rest;
    for (let i = 1; i < allPs.length; i++) {
      bodyHtml += allPs[i].outerHTML;
    }

    const callout = document.createElement("div");
    callout.className = `callout callout-${type}`;
    callout.innerHTML = `
      <span class="callout-icon">${icons[type] || "📌"}</span>
      <div class="callout-body">${bodyHtml}</div>
    `;

    bq.replaceWith(callout);
  });
}