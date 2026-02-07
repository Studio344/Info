# Things to Know When Deploying Static Sites to GitHub Pages

## Introduction

Studio344's portfolio site is hosted on GitHub Pages. I chose it thinking "it's free and integrated with GitHub, so it should be easy," but running it in practice revealed several nuances. In this article, I'll summarize best practices and considerations for deploying static sites to GitHub Pages.

## Basic GitHub Pages Setup

### Custom Domain Configuration

Setting up a custom domain (studio344.net) on GitHub Pages requires these steps:

1. Enter the domain in Repository Settings → Pages → Custom domain
2. Configure DNS records (A records or CNAME)
3. Enable HTTPS (auto-issued via Let's Encrypt)

For apex domains (studio344.net), point A records to GitHub's IPs:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For subdomains (www.studio344.net), use CNAME records.

### The CNAME File

Setting a custom domain auto-generates a `CNAME` file in the repository root. Accidentally deleting this file will remove the custom domain configuration — so be careful.

## Deployment Workflow

### Branch-Based Deployment

GitHub Pages deploys content from a specific branch (usually `main`) by default. Studio344 uses this workflow:

1. Develop on `fix/` or `feature/` branches
2. Test locally
3. Merge to `main` → automatic deployment

This simple flow works well, but branch protection prevents direct pushes to `main`.

### Caching Issues

GitHub Pages is served via CDN (Fastly), so caches may persist after deployment. When updating CSS or JS, users might see stale files in their browsers.

As a countermeasure, I use cache busting with query parameters for important updates:

```html
<link rel="stylesheet" href="styles.css?v=20260207">
```

## Static Site Constraints and Solutions

### JavaScript Rendering Challenges

GitHub Pages only serves static files — no server-side processing. Studio344's blog articles are dynamically rendered from Markdown files using JavaScript, which creates SEO challenges.

If crawlers don't execute JavaScript, the content is invisible. The solution is providing `<noscript>` tags with static fallback content.

### Form Handling

HTML forms can't be processed by GitHub Pages alone. Studio344 uses external services like Formspree to handle form submissions serverlessly.

### Custom 404 Pages

GitHub Pages displays a custom 404 page when you place a `404.html` file. For SPAs, you can redirect all routes to `index.html`, but for multi-page sites like Studio344, a straightforward `404.html` is the best approach.

## Performance Optimization

The GitHub Pages + CDN combination is fast enough, but further optimization includes lazy-loading scripts with `defer` and `async`. The AdSense script uses `async` to avoid blocking initial page render.

## Conclusion

GitHub Pages is an excellent hosting service for static sites. Free custom domain + HTTPS and Git integration make deployment easy. However, proper countermeasures are needed for static-site-specific challenges like cache management, SEO optimization, and form handling. With these points covered, smooth operation is entirely achievable.
