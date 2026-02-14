# The CSS Cascade Order Trap — Lessons from a 4000-Line Single CSS File

A mobile layout collapse on my portfolio site turned out to be caused by one of CSS's most fundamental (yet easily overlooked) mechanisms: cascade order. This article walks through the actual bug, root cause analysis, and the prevention rules I added to my development guidelines.

## What Happened

The homepage Bento Grid cards (Projects / Blog / Let's Connect) were squished on mobile. Each card stayed at `grid-column: span 4` (3-column layout) instead of expanding to full-width `span 12` on small screens.

```css
/* Expected: full width on mobile */
.home-nav-card--projects,
.home-nav-card--blog,
.home-nav-card--connect {
  grid-column: span 12; /* ← Not being applied */
}
```

## Root Cause: Cascade Order

CSS has a fundamental rule: **when two rules have the same specificity, the one written later wins.**

Inspecting `styles.css` revealed this structure:

```
Line 1762: @media (max-width: 768px) {
             .home-nav-card--projects { grid-column: span 12; }  ← Mobile rule
           }

Line 3302: .home-nav-card--projects { grid-column: span 4; }     ← Base style
```

The **base style (line 3302) was defined after the media query (line 1762)**. With equal specificity, cascade order means the base style wins — even when the media query condition evaluates to `true`.

## Why It Happened

This project's `styles.css` is a **single file with 4000+ lines**. Over time, it developed this structure:

1. **Initial implementation** (~line 1800): Layout + media queries written together
2. **Design renewal** (~line 3300): New nav card styles added

The renewal styles were appended **after** the existing media queries, silently overriding the mobile rules.

## The Fix

Place the media query **immediately after** the component's base styles:

```css
/* Base styles */
.home-nav-card--projects { grid-column: span 4; }
.home-nav-card--blog     { grid-column: span 4; }
.home-nav-card--connect  { grid-column: span 4; }

/* ↓ Responsive override right below (no distant placement) */
@media (max-width: 768px) {
  .home-nav-card--projects,
  .home-nav-card--blog,
  .home-nav-card--connect {
    grid-column: span 12;
  }
}
```

## Prevention: 3 Rules

Based on this experience, I added three rules to my `copilot-instructions.md`:

### 1. Check Cascade Order

Before adding a new base style, verify that no existing media query for the same selector appears **earlier** in the file.

### 2. Grep All Existing Rules

```bash
grep -n "home-nav-card" styles.css
```

Before modifying or adding a selector, check all occurrences and verify there are no conflicts with media query definitions.

### 3. Bundle Component + Responsive Styles

Always write a component's base styles and its responsive overrides **adjacent to each other**. Never append mobile overrides to a distant media query block elsewhere in the file.

## Lessons Learned

| Aspect | Takeaway |
|--------|----------|
| CSS Design | In single-file architecture, cascade order is the #1 risk |
| Dev Process | Always `grep` existing definitions before adding new styles |
| Documentation | Codify structural risks in guidelines/prompts for automation |
| Testing | Always verify CSS changes at mobile width (375px) |

## Conclusion

Cascade order is CSS 101, but it becomes a subtle trap as files grow larger. Especially in **single CSS file** architectures, the order in which components are added directly determines cascade order. The rule "bundle component + responsive as a unit" is essential.

With vanilla CSS (no framework), these fundamentals directly cause bugs — and directly fix them, too.
