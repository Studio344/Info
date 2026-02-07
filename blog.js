document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();

    // Re-load posts when language changes
    i18next.on('languageChanged', (lng) => {
        loadBlogPosts(lng);
    });
});

let currentRequestId = 0;

/**
 * Extract the first heading (# ...) from markdown text
 */
function extractTitle(mdText) {
    const match = mdText.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
}

/**
 * Extract a plain-text excerpt from markdown (skip headings, code blocks, tables)
 */
function extractExcerpt(mdText, maxLength = 120) {
    const lines = mdText.split('\n');
    let excerpt = '';
    let inCodeBlock = false;

    for (const line of lines) {
        // Toggle code block state
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        // Skip headings, empty lines, tables, images, HTML tags
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('#')) continue;
        if (trimmed.startsWith('|')) continue;
        if (trimmed.startsWith('![')) continue;
        if (trimmed.startsWith('<')) continue;
        if (trimmed.startsWith('- **') || trimmed.startsWith('- `')) continue;

        // Clean markdown formatting
        let clean = trimmed
            .replace(/\*\*(.+?)\*\*/g, '$1')  // bold
            .replace(/\*(.+?)\*/g, '$1')       // italic
            .replace(/`(.+?)`/g, '$1')         // inline code
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
            .replace(/<br\s*\/?>/g, ' ')        // line breaks
            .trim();

        if (clean.length > 0) {
            excerpt += (excerpt ? ' ' : '') + clean;
            if (excerpt.length >= maxLength) break;
        }
    }

    if (excerpt.length > maxLength) {
        excerpt = excerpt.substring(0, maxLength).trim() + '…';
    }
    return excerpt;
}

async function loadBlogPosts(langOverride) {
    const listUrl = 'assets/posts/list.json';
    const container = document.getElementById('blog-container');
    
    // Normalize language to 2 characters (e.g., 'en-US' -> 'en')
    let rawLang = langOverride || i18next.language || 'ja';
    const currentLang = rawLang.substring(0, 2);

    if (!container) return;
    
    // Increment request ID to invalidate previous running tasks
    const requestId = ++currentRequestId;

    const readMoreText = currentLang === 'ja' ? '続きを読む →' : 'Read more →';

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
                    emoji: post.emoji || '📝',
                    tags: post.tags || [],
                    title: extractTitle(mdText),
                    excerpt: extractExcerpt(mdText)
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
        container.innerHTML = '';
        
        loadedPosts.forEach((post, index) => {
            if (!post) return;
            const card = document.createElement('a');
            card.href = `blog-post.html?id=${post.id}`;
            card.className = 'blog-preview-card';
            card.style.animationDelay = `${index * 0.08}s`;

            const tagsHtml = post.tags.map(t => `<span class="blog-preview-tag">${t}</span>`).join('');

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
        console.error('Error fetching post list:', err);
    }
}

