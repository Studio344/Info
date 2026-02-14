# I Asked GitHub Copilot to Improve My Site with 128 Items — An AI-Driven Refactoring Case Study

I asked GitHub Copilot to analyze my portfolio site studio344.net from 5 perspectives, which generated 128 improvement proposals. All of them were implemented across 4 phases. This article shares the results and lessons learned from AI pair programming.

## The Starting Point

The site was functional, but had several gaps:

- No security headers
- Unoptimized performance
- Incomplete accessibility support
- No PWA capabilities
- Blog UX needed improvement

Addressing these manually would take weeks. So I asked GitHub Copilot: "Analyze the entire site from 5 perspectives and generate improvement proposals."

## 5 Analysis Perspectives

The dimensions I instructed Copilot to analyze:

| Perspective | Focus | Items |
|-------------|-------|-------|
| 🔒 Security | CSP, SRI, Cookie consent, external link safety | 24 |
| ⚡ Performance | Image optimization, lazy loading, scroll throttling | 28 |
| ♿ Accessibility | ARIA attributes, keyboard navigation, WCAG compliance | 32 |
| 🎨 UX/UI | Skeleton UI, social share, related posts, TOC | 26 |
| 🛠️ DevOps | CI/CD, RSS generation, sitemap, PR template | 18 |

Total: **128 improvement items** generated.

## 4-Phase Implementation

The 128 items were prioritized into 4 phases:

### Phase 1: Quick Wins

- CSP meta tags on all pages
- `rel="noopener noreferrer"` on external links
- `loading="lazy"`, `width`, `height` on images
- ARIA attribute fixes
- Skip-to-content links

### Phase 2: Security & GDPR

- Cookie consent banner
- Conditional AdSense loading
- SRI hash addition and verification
- `X-Content-Type-Options`, `Referrer-Policy` meta tags

### Phase 3: UX Improvements

- Blog skeleton loading UI
- Social share buttons (Twitter, copy, Web Share API)
- Related articles auto-display
- Table of contents (TOC) sidebar

### Phase 4: Infrastructure & DevOps

- Service Worker (Network-First)
- PWA manifest
- RSS feed generation
- CI pipeline (HTML validation, i18n key checking)
- PR template

## Actual Git Commits

```
655c4b2 🚀 Phase 2-4 bulk implementation
074263f 🛠️ CI/CD and DevOps infrastructure
a41fdd3 🍪 Cookie consent banner implementation
96631f9 ⚡ Phase 1 quick wins implementation
```

**35 files changed, +6,871 lines, -103 lines**

## Lessons from AI-Driven Development

### ✅ What Worked Well

1. **Comprehensiveness**: AI caught items humans often miss (ARIA, `rel` attributes, SRI)
2. **Speed**: 128 items proposed and implemented in one session — would take weeks manually
3. **Consistency**: Unified implementation following coding conventions
4. **Learning**: Each fix came with explanations, deepening technical knowledge

### ⚠️ What Required Caution

1. **CSS cascade order**: AI-added styles conflicted with existing media queries → mobile layout broke
2. **SRI hashes**: Hash copied from docs didn't match the actual CDN file → script blocked
3. **Double rendering bug**: Blog render function called twice, duplicating share buttons
4. **Preview is essential**: Code generation alone isn't enough — browser verification is mandatory

### 🔧 Prompt Improvements

After finding these bugs, I analyzed their root causes and added prevention rules to `copilot-instructions.md`:

- CSS cascade order verification rules (3 items)
- SRI hash computation verification procedure
- Mobile display structural checks

**By improving the prompt, I built a system that prevents repeating the same mistakes.**

## The Importance of copilot-instructions.md

The most important aspect of AI-driven development is **explicitly documenting project-specific rules in the prompt**.

Our `copilot-instructions.md` includes:

- Directory structure and file roles
- Coding conventions (HTML / CSS / JS)
- Security checklist
- Blog post addition procedure
- i18n rules
- Git workflow
- Quality check items
- Known caveats

This enables Copilot to generate code with full project context understanding.

## Results by the Numbers

| Metric | Before | After |
|--------|--------|-------|
| Security headers | 0 | CSP + 2 meta tags |
| ARIA attributes | Partially missing | Full coverage |
| Cookie consent | None | GDPR-compliant banner |
| PWA | Not supported | Manifest + SW |
| RSS | None | feed.xml + auto-generation |
| CI/CD | None | HTML validation + i18n check |
| Blog UX | Basic only | TOC + share + related posts |

## Conclusion

The 128-item site improvement driven by GitHub Copilot was effective through the combination of **AI's comprehensiveness × human review**. AI can rapidly generate proposals and implementations, but environment-dependent issues like CSS cascade order and SRI hash mismatches require human review and browser preview.

The most valuable outcome was analyzing bug root causes and adding prevention rules to `copilot-instructions.md`. AI output quality is proportional to instruction quality. **Prompt engineering is now part of software engineering.**
