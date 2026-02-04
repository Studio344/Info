document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();

    // Re-load posts when language changes
    i18next.on('languageChanged', (lng) => {
        loadBlogPosts(lng);
    });
});

let currentRequestId = 0;

async function loadBlogPosts(langOverride) {
    const listUrl = 'assets/posts/list.json';
    const container = document.getElementById('blog-container');
    
    // Normalize language to 2 characters (e.g., 'en-US' -> 'en')
    let rawLang = langOverride || i18next.language || 'ja';
    const currentLang = rawLang.substring(0, 2);

    if (!container) return;
    
    // Increment request ID to invalidate previous running tasks
    const requestId = ++currentRequestId;

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
                    date: post.date,
                    content: marked.parse(mdText)
                };
            } catch (err) {
                console.error(`Failed to load ${filename}`, err);
                return null;
            }
        });

        const loadedPosts = await Promise.all(postPromises);

        // Check again before DOM manipulation
        if (requestId !== currentRequestId) return;

        // Clear and append
        container.innerHTML = '';
        
        loadedPosts.forEach(post => {
            if (!post) return;
            const article = document.createElement('article');
            article.className = 'blog-item';
            article.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            article.style.paddingBottom = '2rem';
            article.style.marginBottom = '2rem';

            article.innerHTML = `
                <span style="font-size: 0.85rem; color: #6366f1;">${post.date}</span>
                <div class="markdown-content">
                    ${post.content}
                </div>
            `;
            container.appendChild(article);
        });

    } catch (err) {
        console.error('Error fetching post list:', err);
    }
}
