# Designing "Bento Layout" Patterns with CSS Grid

## What is Bento Layout?

The "Bento Layout" — a design pattern that beautifully arranges cards of different sizes on a grid — gained widespread attention after Apple adopted it at WWDC23. Studio344's portfolio site uses this layout, and in this article, I'll explain the design and implementation details.

## Why Bento Layout?

When designing the portfolio site, I had the following requirements:

- **Information density**: Place different types of information (About, Projects, Blog) in limited space
- **Visual hierarchy**: Display important information large, supplementary information compact
- **Responsive**: Layout should naturally adapt from mobile to desktop

Traditional column layouts tend to be monotonous, but Bento Layout allows varying sizes based on each section's importance, creating a natural eye flow.

## Implementation with CSS Grid

### Basic Structure

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.2rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
```

The combination of `auto-fit` and `minmax()` is key — it automatically adjusts the number of columns based on screen width.

### Card Span Control

To extend specific cards across 2 columns:

```css
.bento-card.wide {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .bento-card.wide {
    grid-column: span 1; /* Single column on mobile */
  }
}
```

### Combining with Glassmorphism

Adding a `backdrop-filter` glassmorphism effect to each card creates a sense of depth:

```css
.bento-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  backdrop-filter: blur(24px);
  padding: 2rem;
}
```

## Key Design Considerations

### 1. Content First

Rather than starting with layout, I first clarified "what to communicate," then determined the grid placement. The hero section gets full width, Tech Stack gets medium size, and nav panels stay compact.

### 2. Consistent Spacing

Using `gap: 1.2rem` throughout the grid and consistent `padding` within cards maintains the orderly impression of a "bento box" divider.

### 3. Accessibility

Card focus states are clearly indicated, enabling smooth keyboard navigation. The combination of `tabindex` and `:focus-visible` is effective here.

## Mobile Optimization

The biggest challenge with Bento Layout is mobile responsiveness. A beautiful desktop grid can become a monotonous vertical stack on smartphones.

Studio344 addresses this with:

- **Below 768px**: All cards in single column
- **Card order optimization**: Using `order` property to rearrange cards for mobile (Hero → About → Projects → Blog)
- **Touch support**: Tap feedback instead of hover effects

## Conclusion

Bento Layout is an excellent pattern that balances presentation with information architecture. Leveraging CSS Grid's `auto-fit` and `minmax()` makes responsive adaptation relatively straightforward. It's particularly effective for portfolio sites and dashboards where different types of information need to coexist on a single screen.
