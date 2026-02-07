# How to Add Multilingual Support to a Static HTML Site with i18next

## Introduction

The Studio344 portfolio site supports both **Japanese (JA)** and **English (EN)**. To achieve internationalization on a pure static HTML site without any framework, I chose the lightweight i18n library **i18next**.

This article walks through the concrete implementation of adding multilingual support with i18next to a static HTML site, along with the design decisions and tricks I found useful.

## Why i18next?

Several frontend i18n libraries exist, but i18next stood out for these reasons:

- **Framework-agnostic**: Works with vanilla JavaScript — no React, Vue, or Angular dependency
- **Rich ecosystem**: Plugins for browser language detection, localStorage persistence, and more
- **Proven track record**: Over 10 years of history with adoption in large-scale projects
- **CDN-ready**: No npm or build tools required — just a single script tag

The ability to work without build tools was the deciding factor for a static site like this one.

## Basic Implementation

### 1. Loading the Library

Include i18next and the browser language detector plugin via CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/i18next/23.2.3/i18next.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/i18next-browser-languagedetector/7.1.0/i18nextBrowserLanguageDetector.min.js"></script>
```

### 2. Defining Translation Resources

Translation data is structured by language in a JavaScript file:

```javascript
const resources = {
  ja: {
    translation: {
      hero_title: "Welcome to Studio344",
      nav_projects: "Projects",
      nav_blog: "Blog"
    }
  },
  en: {
    translation: {
      hero_title: "Welcome to Studio344",
      nav_projects: "Projects",
      nav_blog: "Blog"
    }
  }
};
```

### 3. Declarative Translation in HTML

Add `data-i18n` attributes to elements that need translation:

```html
<h1 data-i18n="hero_title">Welcome to Studio344</h1>
```

### 4. Initialization and Application

Initialize i18next and apply translations to all marked elements:

```javascript
i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: 'ja',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })
  .then(() => updateContent());

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18next.t(el.getAttribute('data-i18n'));
  });
}
```

## Implementation Highlights

### Language Switcher UI

A **JA / EN** toggle button is placed in the header. Clicking it calls `i18next.changeLanguage()` and re-runs `updateContent()`, instantly switching the entire page. The selected language is saved in localStorage, so it persists across visits.

### Translating HTML Attributes

While `data-i18n` normally replaces `textContent`, sometimes you need to translate **attribute values** like form placeholders. i18next handles this with a bracket prefix:

```html
<input data-i18n="[placeholder]search_placeholder" placeholder="Search..." />
```

### Blog Post Multilingual Strategy

Blog posts are stored as Markdown files, which don't fit neatly into i18next's JSON resource model. The solution was to maintain **separate files per language**:

```
assets/posts/
  2026-01-20-fitbit.ja.md   ← Japanese version
  2026-01-20-fitbit.en.md   ← English version
```

When the language changes, the blog loader listens for i18next's `languageChanged` event and reloads the corresponding language file. This keeps each translation as a complete, standalone document.

### Dynamic HTML lang Attribute

The `<html lang="ja">` attribute is updated dynamically on language change, ensuring screen readers and browser language detection work correctly:

```javascript
i18next.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
```

## Considerations and Trade-offs

### SEO Impact

Since translations are applied client-side, search engine crawlers that don't execute JavaScript may only index the default language (Japanese). For sites using SSR or SSG, generating pre-rendered HTML per language would be more SEO-friendly.

For Studio344, I've added `hreflang` meta tags and language-specific sitemap entries to help search engines discover both language versions.

### Preventing Missing Translations

To avoid forgetting translation keys when adding new pages, all `data-i18n` keys are centralized in a single file (`i18n.js`). This makes it easy to spot gaps and ensures consistency across the site.

## Conclusion

i18next is a practical and powerful internationalization solution even for static HTML sites without frameworks. The declarative `data-i18n` approach cleanly separates HTML structure from translation logic, resulting in maintainable code.

For anyone starting with a small portfolio site and planning to grow it over time, this approach offers an excellent balance of simplicity and flexibility.
