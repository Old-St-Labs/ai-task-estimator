---
name: frontend-add-component
description: 'Create and manage Storybook stories for a Vite-built React library under libs/frontend/components/. Use for: setting up Storybook from scratch (only when not already installed), creating CSF3 story files, configuring Tailwind CSS in Storybook, writing interaction tests with play functions, a11y accessibility checks in stories. Components live in libs/frontend/components/src/base/ with co-located .stories.tsx files. Trigger words: storybook, story, stories, component, add component, component story, CSF, play function, addon-a11y, controls, args.'
---

# Storybook Component Skill

## When to Use

- User says "add a story", "create a story", "write a storybook story", "add storybook"
- Setting up Storybook in a project that doesn't have it yet
- Creating a new component and its story file
- Adding interaction tests (play functions) or a11y checks to an existing story

## Procedure

### Step 0 — Clarify Requirements with the User

Before writing any code, confirm the component's feature and functionality with the user. Do not assume. Ask clarifying questions such as:

- What is the component supposed to do?
- What props or states should it support?
- Are there icon(s) involved? If so, what do they represent?
- Are there interactive behaviours (hover, disabled, loading, etc.)?
- What variants or sizes are needed?

Only proceed to Step 1 once you have clear answers.

### Step 1 — Check for Existing Storybook

Before anything else, check whether Storybook is already installed:

- Look for a `.storybook/` directory under `libs/frontend/components/`
- Check `package.json` for `"storybook"` in scripts or dependencies

If Storybook is **not installed**, follow [Setup Guide](./references/setup.md) before continuing.  
If it **is installed**, skip to Step 2.

### Step 2 — Check for Existing Components

Before creating anything new, scan `libs/frontend/components/src/` and ask:

1. **Can an existing component be reused as-is?** Compose it inside the new component instead of duplicating its logic.
2. **Is this a new variation of an existing component?** Add a new story (and variant props if needed) to the existing component rather than creating a separate one.
3. **Is this genuinely new?** Only create a new component folder if neither of the above applies.

### Step 3 — Locate or Create the Component

Components are split into two sub-folders under `libs/frontend/components/src/`:

- **`libs/frontend/components/src/icons/`** — one file per icon, reused across other components
- **`libs/frontend/components/src/base/`** — all other components, each in its own folder

If the component uses an icon, check `libs/frontend/components/src/icons/` first. Create the icon as a standalone component there if it doesn't exist, then import it into the base component.

Each component folder contains the component file, its CSS file, and its story:

```
libs/frontend/components/
├── src/
│   ├── icons/
│   │   └── ChevronIcon.tsx
│   └── base/
│       └── Button/
│           ├── Button.tsx
│           ├── Button.css
│           └── Button.stories.tsx
└── .storybook/
```

If the component doesn't exist yet, create it alongside its story.

**Tailwind classes must live in a co-located CSS file** — do not write Tailwind utility classes inline in the component's JSX. Instead, define them in a `ComponentName.css` file in the same folder and import it in the component:

```css
/* Button/Button.css */
.button {
    @apply px-4 py-2 rounded font-medium;
}
```

```tsx
// Button/Button.tsx
import './Button.css';
```

### Step 4 — Write the Story File

Use [Story Patterns](./references/story-patterns.md) to write the story.  
Use [story.template.tsx](./assets/story.template.tsx) as a starting point — replace `ComponentName` with the real component name.

### Step 5 — Verify

Run Storybook and confirm the story renders without errors:

```bash
npm run storybook
```

## Constraints

- Always use TypeScript (`.stories.tsx` not `.stories.js`)
- Co-locate stories with their components (`Button.stories.tsx` next to `Button.tsx`)
- Use CSF3 format with `satisfies Meta<>` and `satisfies Story<>` — see [Story Patterns](./references/story-patterns.md)
- Import from `@storybook/react`, not `@storybook/nextjs`
- Tailwind classes work in stories after Storybook is configured correctly — see [Setup Guide](./references/setup.md)
- Icons are standalone components in `libs/frontend/components/src/icons/`; import and reuse them — never inline SVGs in base components
- Tailwind classes belong in a co-located `ComponentName.css` file, not in JSX `className` strings
- After installing Storybook, delete all generated example files — keep only the `.storybook/` config and the `storybook` script in `package.json`. Both `stories/` (project root) and `src/stories/` may be generated depending on the framework; delete both: `rm -rf stories/ src/stories/`
