# Static Site Security Hardening — Implementing CSP, GDPR, and SRI on GitHub Pages

Even static sites hosted on GitHub Pages need security measures. This article covers the CSP (Content Security Policy), Cookie consent banner, and SRI (Subresource Integrity) hash verification implemented on studio344.net, with practical code examples.

## Why Static Sites Need Security

"Static sites have no server-side vulnerabilities, so they're safe" — this is a misconception. Loading external scripts via CDN, ad scripts, and rendering user-generated content all create risks for XSS and supply chain attacks on static sites.

## 1. Content Security Policy (CSP)

### GitHub Pages Constraint

GitHub Pages doesn't allow custom HTTP headers. So CSP must be implemented via `<meta>` tags.

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self';
  ">
```

### Key Points

- **`default-src 'self'`**: Only same-origin resources by default
- **`script-src`**: CDN domains listed individually (no wildcards)
- **`style-src 'unsafe-inline'`**: Required for dynamic CSS custom property updates (room for improvement)
- **`img-src data:`**: For base64 inline images

### Apply to All Pages

The CSP meta tag must appear in every HTML file's `<head>`. A single missing page becomes unprotected.

## 2. Additional Security Headers (Meta Tags)

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

- **`X-Content-Type-Options: nosniff`**: Prevents MIME type sniffing
- **`Referrer-Policy`**: Doesn't send path information on cross-origin navigation

## 3. Cookie Consent Banner (GDPR Compliance)

### Architecture

```
assets/js/cookie-consent.js  — Banner show/hide logic
styles.css                   — Banner styling
locales/ja.json, en.json     — Multilingual text
```

### Flow

1. On page load, check `localStorage` for consent state
2. If no consent, show banner
3. "Accept" → Dynamically load AdSense script
4. "Decline" → Continue browsing without ads
5. "Cookie Settings" link in footer allows changing preference anytime

```javascript
function loadAdSense() {
  if (localStorage.getItem('cookie-consent') !== 'accepted') return;
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  document.head.appendChild(script);
}
```

### GDPR Requirements

- **Prior consent**: No tracking cookies before consent
- **Explicit choice**: Both "Accept" and "Decline" buttons presented equally
- **Revocable**: UI to withdraw consent at any time

## 4. SRI (Subresource Integrity) Hash Verification

### What is SRI?

A mechanism to verify that external scripts loaded from CDNs haven't been tampered with.

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js"
  integrity="sha384-eEu5CTj3qG..."
  crossorigin="anonymous"></script>
```

### A Real Issue We Encountered

DOMPurify 3.2.4's SRI hash suddenly mismatched, causing the browser to block the script. The cause: **the CDN file content was updated** (even the same version can have different build artifacts).

### Verification Command

```bash
curl -s https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Compare the output with the `integrity` attribute value in your HTML.

### Lessons

- Copying hashes from documentation isn't enough
- **Download the actual file and recalculate the hash**
- Ideally, add SRI verification to your CI/CD pipeline

## 5. External Link Safety

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
```

- **`noopener`**: Prevents the new tab from accessing `window.opener`
- **`noreferrer`**: Doesn't send referrer information

## 6. DOMPurify Sanitization

Blog posts are converted from Markdown to HTML and inserted via `innerHTML`, making DOMPurify sanitization essential.

```javascript
const cleanHTML = DOMPurify.sanitize(rawHTML);
document.getElementById('content').innerHTML = cleanHTML;
```

## Security Checklist

Items to verify on every change:

- [ ] Is DOMPurify used when inserting via `innerHTML`?
- [ ] Do external CDN scripts have `integrity` + `crossorigin="anonymous"`?
- [ ] Has the SRI hash been recalculated from the actual file?
- [ ] Do external links have `rel="noopener noreferrer"`?
- [ ] Are `locales/*.json` files free of dangerous HTML?
- [ ] Has the CSP meta tag been updated for new CDN domains?

## Conclusion

Even for static sites, security should be implemented in layers. CSP restricts loading origins, SRI detects tampering, Cookie consent meets legal requirements, and DOMPurify prevents XSS. Despite GitHub Pages limitations (no custom headers), `<meta>` tags and JavaScript provide sufficient protection.
