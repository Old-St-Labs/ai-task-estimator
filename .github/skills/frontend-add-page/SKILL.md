---
name: frontend-add-page
description: Add a new page to the Next.js web-app. Use this when creating a new page route. Covers the thin-orchestrator page pattern and updated routing and navigation.
---

# Adding a Web-App Page + Domain Components

This skill generates a new page in the AI Task Estimator Next.js frontend.

Tech stack:

- **Framework:** Next.js 14 App Router (`apps/web-app/src/app/`)
- **UI:** Custom components with Tailwind CSS + Headless UI (`@headlessui/react`)
- **Styling**: Tailwind CSS in SCSS modules
- **Server state:** TanStack Query v5 (`@tanstack/react-query`)
- **Global client state:** `zustand`
- **Types/DTOs:** `@ai-task-estimator/dto` (from `libs/dto/`)
- **Path alias:** `@web-app/*` → `apps/web-app/src/*`

Canonical references:

- Page: `apps/web-app/src/app/{domain}/page.tsx`
- Domain components: `apps/web-app/src/components/{domain}/`
- Global components: `apps/web-app/src/components/global/`
- Base components: `libs/frontend/components/`
- Hooks: `apps/web-app/src/hooks/`
- Utility functions shared between apps: `libs/utils/`
- Utility functions specific to the web-app: `apps/web-app/src/utils/`
- API client: `libs/frontend/data-access/`

---

## Required Information — Ask First

Before writing any code, confirm:

1. **Which domain?** (e.g. `task-estimator`, `stories`, `staff-capacity`)
2. **What entity is displayed?** (e.g. `TaskEstimator`, `Story`)
3. **What data-fetching hook exists?** — if none, create one following Step 1
4. **What util functions are needed?** (e.g. converting kabab-case ENUM statuses to sentence case)
5. **What components are needed in the page?** (e.g. table, create form, action menu, status badges)

---

## Ordered Implementation Steps

Work through these in order — the page depends on components, which depend on hooks.

---

### Step 1 — API Client + Query Hooks

Before building UI, ensure the API client and TanStack Query hooks exist. If not, the skill `webapp-endpoint-integration` may be used to implement the API client and hooks first.

---

### Step 2 - Util functions

The folder `apps/web-app/src/utils/` contains utility functions specific to the web-app. If the page needs any utility functions (e.g. status-variant mapping for badges), add these to `apps/web-app/src/utils/status-variants.ts` or create a new utils file under `apps/web-app/src/utils/` if more appropriate.

---

### Step 3 - Components

The domain folder (`apps/web-app/src/components/{domain}/`) contains all components related to the page while the folder `libs/frontend/components/` contains shared components, such as Button, Typography, Badges, and Table components. Check the component file names and prioritize using existing components over creating new ones. Implement the required components based on the page's needs if they do not yet exist (TODO: reference create component skill).

---

### Step 4 — Page Orchestrator

File: `apps/web-app/src/app/{domain}/page.tsx`

The page is a **thin orchestrator**. It manages state and wires child components — it contains no table/form markup of its own.

**`apps/web-app/src/app/{domain}/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { use{Entity}s } from '@web-app/hooks/use-{domain}';
import { Create{Entity}Form } from '@web-app/components/{domain}/create-{entity}-form';
import { {Entity}sTable } from '@web-app/components/{domain}/{domain}-table';
import styles from './page.module.scss';

export default function {Entity}sPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, isError, error } = use{Entity}s();

  return (
    <div className={styles['{domain}-page']}>
      <div className={styles['{domain}-page__header']}>
        <h1 className={styles['{domain}-page__title']}>{Entity}s</h1>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className={styles['{domain}-page__create-button']}
        >
          {showCreate ? 'Close' : '+ New {Entity}'}
        </button>
      </div>

      {showCreate && (
        <Create{Entity}Form onClose={() => setShowCreate(false)} />
      )}

      {isLoading && (
        <p className={styles['{domain}-page__status-message']}>Loading {entity}s…</p>
      )}
      {isError && (
        <p className={styles['{domain}-page__status-message--error']}>
          {error instanceof Error ? error.message : 'Failed to load {entity}s'}
        </p>
      )}
      {data && <{Entity}sTable {entity}s={data} />}
    </div>
  );
}
```

**`apps/web-app/src/app/{domain}/page.module.scss`**

```scss
.{domain}-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  &__create-button {
    border-radius: 0.25rem;
    background-color: #2563eb;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #ffffff;
    cursor: pointer;
    border: none;

    &:hover {
      background-color: #1d4ed8;
    }
  }

  &__status-message {
    font-size: 0.875rem;
    color: #6b7280;

    &--error {
      font-size: 0.875rem;
      color: #dc2626;
    }
  }
}
```

For specific entity pages, such as a page for viewing a specific entity, create a new file `apps/web-app/src/app/{domain}/[id]/page.tsx` using dynamic NextJS routing and follow the same thin-orchestrator pattern. For actions involving the specific entity, such as editing the entity, create a new file `apps/web-app/src/app/{domain}/[id]/edit/page.tsx` and follow the same pattern.

**Rules:**

- Create a separate SCSS file for styling the page using the file name `page.module.scss` within the same folder as the page component. Do not use inline Tailwind classes on the page component itself.
- Use Block Element Modifier (BEM) naming conventions for CSS classes in the SCSS file.
- All imports use the `@web-app/*` alias (maps to `apps/web-app/src/*`).
- Do **not** put table or form markup directly in this file.

---

### Step 5 — Sidebar / Navigation

Look for the navigation component in `apps/web-app/src/components/global/`, such as a navigation bar or sidebar. If it does not yet exist, ignore this step. If the user asks you to implement it, create it using the skill ``. Then, add the new page to the navigation items, such as this example:

```typescript
const navItems = [
    // ... existing items
    { href: '/{domain}', label: '{Entity}s' },
];
```

**Rules:**

- `href` uses the kebab-case route path matching the `app/{domain}/` folder name.
- `label` is the human-readable plural name.
- Place the new entry in logical order (core features first, settings/auth last).

---

### Step 6 - Routing

Add the new route to the `ROUTES` constant in `libs/utils/src/config/constants.ts`. Use the following pattern for route paths depending on the type of page being added:

```typescript
export const ROUTES = {
    // ... existing routes
    {DOMAIN}_LIST: '/{domain}', // example for a list page
    ADD_{DOMAIN}: '/{domain}/add', // example for a create page
    EDIT_{DOMAIN}: '/{domain}/:id/edit', // example for an edit page
    {DOMAIN}_DETAILS: '/{domain}/:id', // example for a details page
}
```

---

## Real example

- TODO: add a real example from the codebase

---

## Common Mistakes to Avoid

- **Putting table/form markup in the page** — the page is a thin orchestrator. All markup lives in domain components.
- **Hardcoding status strings** — always use `StateStatus.VALUE` from `@ai-task-estimator/dto`.
- **Calling `fetch()` or `axios` directly in a component** — all data-fetching goes through TanStack Query hooks in `libs/frontend/data-access/`.
- **Forgetting `'use client'`** — pages and components that use hooks or event handlers must be client components.
- **Forgetting to add the page to the sidebar, navigation bar, or the routing** — check for the navigation component in `components/global` after creating a new route.
- **Importing DTOs from anywhere other than `@ai-task-estimator/dto`** — never duplicate DTO definitions inside the web-app.
- **Missing `type="button"` on non-submit buttons** — always set this to prevent accidental form submissions inside `<form>` elements.
