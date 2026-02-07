# Building an Animated Portfolio on GitHub Pages with GSAP

## Introduction

When building an engineer's portfolio site, you face a fundamental question: "Should I use a framework, or is vanilla HTML/CSS/JS enough?" For Studio344, I chose the latter — **GitHub Pages** + **GSAP** + **vanilla JavaScript** — and achieved a rich animation experience with a remarkably simple stack.

This article covers the technical approach to building a modern portfolio site without frameworks.

## Why No Framework?

Frameworks like React, Next.js, and Astro are powerful, but for a portfolio site specifically, vanilla was the better choice:

- **Deployment simplicity**: GitHub Pages requires no build step — just push and it's live
- **Zero dependencies**: No `node_modules` means virtually no maintenance overhead
- **Deeper learning**: Working with raw web technologies strengthens foundational skills
- **Performance**: Minimal bundle size means blazing fast initial loads

However, "no framework" doesn't mean "no libraries." In the animation domain particularly, libraries like GSAP make a massive difference.

## GSAP + ScrollTrigger in Action

### Why GSAP?

**GSAP (GreenSock Animation Platform)** is one of the highest-performance animation libraries on the web:

- **60fps guaranteed**: Built on requestAnimationFrame for jank-free smoothness
- **Timeline orchestration**: Chain multiple animations in sequence with precise control
- **ScrollTrigger plugin**: Declaratively link animations to scroll position
- **Easing functions**: Physics-based easing like `power2.out` and `elastic.inOut` for natural motion

### Implementation: Card Fade-In

On the Studio344 landing page, each card fades in as the user scrolls:

```javascript
gsap.utils.toArray('.bento-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    delay: i * 0.1,
    ease: 'power2.out'
  });
});
```

The key is `delay: i * 0.1` — by adding a delay proportional to each card's index, you create a **staggering effect** (sequential animation) with minimal code.

### Mouse-Following Parallax

The hero section features a subtle parallax effect where background elements shift based on cursor position:

```javascript
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  gsap.to('.aurora-orb', {
    x: x,
    y: y,
    duration: 1,
    ease: 'power2.out'
  });
});
```

Keeping the displacement subtle (±20px) ensures an elegant effect that enhances rather than distracts.

## Implementing Aurora UI

### Background Layer Composition

The Studio344 background consists of multiple layered elements:

1. **Aurora Orbs**: Large blurred gradient circles serving as color accents
2. **Grid Overlay**: Semi-transparent 1px grid lines for a tech aesthetic
3. **Noise Texture**: CSS-based noise to prevent flat, sterile appearance
4. **Spotlight**: A light source effect that follows the mouse cursor

```css
.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.grid-overlay {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

Proper `z-index` layering creates a sense of spatial depth throughout the page.

## Bento Grid Layout

### CSS Grid Implementation

The content area uses a **Bento Grid** layout — the card-based UI pattern popularized by Apple's recent design language:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
}

.bento-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
}
```

The 12-column grid provides flexibility — cards can span 4, 6, or 12 columns, and responsive breakpoints are straightforward to implement.

### Glassmorphism Effect

Combining `backdrop-filter: blur()` with semi-transparent backgrounds creates a **Glassmorphism** effect. The Aurora orbs in the background are visible through the cards as soft, blurred shapes, adding a beautiful layer of depth.

## GitHub Pages Deployment

### Custom Domain Setup

Setting up a custom domain (`studio344.net`) on GitHub Pages:

1. Configure A records or CNAME at your DNS provider
2. Enter the custom domain in Repository Settings → Pages
3. Enable "Enforce HTTPS" (automated via Let's Encrypt)

### The Deployment Flow

```
1. Make changes locally
2. git add → git commit → git push
3. GitHub Pages deploys automatically
4. Live in seconds to minutes
```

With no build step, the latency from push to deployment is minimal.

## Conclusion

You don't need a framework to build a modern, richly animated portfolio site. GSAP combined with CSS Grid delivers a polished experience, and GitHub Pages' free hosting means you can run a custom domain HTTPS site at **zero cost**.

What matters most isn't the tooling — it's **what you communicate to your audience**. Beyond showcasing your tech stack, telling the story behind each project transforms a portfolio from a simple gallery into a narrative of your engineering journey.
