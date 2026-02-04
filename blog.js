document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();

    // Re-load posts when language changes
    i18next.on('languageChanged', (lng) => {
        loadBlogPosts(lng);
    });
});

async function loadBlogPosts(langOverride) {
    const listUrl = 'assets/posts/list.json';
    const container = document.getElementById('blog-container');
    
    // Normalize language to 2 characters (e.g., 'en-US' -> 'en')
    let rawLang = langOverride || i18next.language || 'ja';
    const currentLang = rawLang.substring(0, 2);

    if (!container) return;

    try {
        const response = await fetch(listUrl);
        const posts = await response.json();

        // Clear existing content
        container.innerHTML = '';

        for (const post of posts) {
            const filename = `assets/posts/${post.baseFilename}.${currentLang}.md`;
            
            try {
                const mdResponse = await fetch(filename);
                if (!mdResponse.ok) {
                   console.error(`Failed to load markdown: ${filename}`);
                   continue;
                }
                const mdText = await mdResponse.text();
                const htmlContent = marked.parse(mdText);

                const article = document.createElement('article');
                article.className = 'blog-item';
                article.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                article.style.paddingBottom = '2rem';
                article.style.marginBottom = '2rem';

                article.innerHTML = `
                    <span style="font-size: 0.85rem; color: #6366f1;">${post.date}</span>
                    <div class="markdown-content">
                        ${htmlContent}
                    </div>
                `;
                container.appendChild(article);
            } catch (err) {
                console.error('Error fetching markdown:', err);
            }
        }
    } catch (err) {
        console.error('Error fetching post list:', err);
    }
}
