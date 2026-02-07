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

  // 「戻る」ボタンのクリック処理
  const backBtn = document.getElementById("blog-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", window.location.pathname);
      showPostList();
    });
  }
});

let currentRequestId = 0;

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
  if (title) title.style.display = "";
  if (desc) desc.style.display = "";
  document.title = "Blog - Studio344";
}

/**
 * 記事一覧を非表示にし、単一記事を表示する
 */
async function showSinglePost(postId) {
  const grid = document.getElementById("blog-container");
  const single = document.getElementById("blog-single-view");
  const content = document.getElementById("blog-single-content");

  if (!grid || !single || !content) return;

  // グリッドとタイトル・説明文を非表示
  grid.style.display = "none";
  const title = document.querySelector(".bento-card.text-content-card > h1");
  const desc = document.querySelector(".bento-card.text-content-card > p");
  if (title) title.style.display = "none";
  if (desc) desc.style.display = "none";

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

    const filename = `assets/posts/${post.baseFilename}.${currentLang}.md`;
    const mdRes = await fetch(filename);
    if (!mdRes.ok) throw new Error("Failed to load post");
    const mdText = await mdRes.text();

    content.innerHTML = `
      <span style="font-size: 0.85rem; color: #6366f1; margin-bottom: 1rem; display: block;">${post.date}</span>
      ${marked.parse(mdText)}
    `;
  } catch (err) {
    console.error("Error loading post:", err);
    content.innerHTML =
      '<p style="color: #888;">記事の読み込みに失敗しました。</p>';
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
function extractExcerpt(mdText, maxLength = 120) {
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

    // Check again before DOM manipulation
    if (requestId !== currentRequestId) return;

    // Clear and append preview cards
    container.innerHTML = "";

    loadedPosts.forEach((post, index) => {
      if (!post) return;
      const card = document.createElement("div");
      card.className = "blog-preview-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.style.animationDelay = `${index * 0.08}s`;

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
  } catch (err) {
    console.error("Error fetching post list:", err);
  }
}
