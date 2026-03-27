---
name: tailwind-v4
description: Tailwind CSS v4 — CSS-first configuration, @theme tokens, and utility patterns. Activate when writing styles, extending the design system, or configuring Tailwind.
---

# Tailwind CSS v4

## Critical: No `tailwind.config.js`

Tailwind v4 is configured entirely in CSS. **Do not create `tailwind.config.js`.**

Configuration lives in `app/globals.css`.

## Setup

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Custom design tokens */
  --color-brand: oklch(60% 0.22 265);
  --color-brand-hover: oklch(53% 0.24 265);
  --font-display: "Inter", sans-serif;
  --radius-card: 0.75rem;
}
```

The PostCSS plugin is `@tailwindcss/postcss` — already configured in `postcss.config.mjs`.

## Custom Tokens with `@theme`

Tokens defined in `@theme` become Tailwind utilities automatically:

```css
@theme {
  --color-indigo-500: oklch(60% 0.22 265);
  --spacing-18: 4.5rem;
  --font-display: "Inter", sans-serif;
}
```

Usage in JSX:
```tsx
<div className="bg-indigo-500 font-display mt-18">...</div>
```

## Existing Tokens (this project)

From `app/globals.css`:
- `indigo-50` through `indigo-800` — primary/brand color scale
- Standard Tailwind utilities all available

## Responsive Prefixes

Same as Tailwind v3: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Dark Mode

```css
@theme {
  --color-bg: white;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-bg: #0a0a0a;
  }
}
```

Or use the `dark:` variant if dark mode variant is enabled.

## Arbitrary Values

Still supported: `w-[350px]`, `bg-[#ff6b00]`, `text-[clamp(1rem,2vw,1.5rem)]`.

## Component Pattern

```tsx
// Group related classes with cn() or template literals
const buttonBase = [
  "inline-flex items-center gap-2",
  "rounded-xl px-6 py-3 text-sm font-semibold",
  "transition-colors",
].join(" ");

const buttonVariants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
};
```

## Common Patterns Used in This Project

```tsx
// Card
"rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"

// Input
"rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"

// Button (primary)
"rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"

// Badge
"rounded-full px-3 py-1 text-sm bg-zinc-100 text-zinc-700"
```

## What Changed from v3

- No `tailwind.config.js` — all config in CSS `@theme`
- `@apply` still works but prefer utility classes directly
- JIT is always on — no `purge` config needed
- `@layer utilities {}` still works for custom utilities
