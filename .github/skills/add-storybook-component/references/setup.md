# Storybook Setup Guide

This guide covers installing and configuring Storybook for the `libs/frontend/components` Vite-built React library.

## Prerequisites Check

Confirm Storybook is not installed:

1. No `.storybook/` directory exists under `libs/frontend/components/`
2. No `storybook` entry in `libs/frontend/components/package.json` scripts or dependencies

If either condition is true, Storybook is already installed — skip this guide.

## Installation

Run the Storybook initializer from the `libs/frontend/components/` directory, specifying the Vite + React framework:

```bash
cd libs/frontend/components
npx storybook@latest init --type react
```

When prompted:

- Accept `@storybook/react-vite` as the framework
- Allow it to install suggested dependencies
- Allow it to add a `storybook` script to `package.json`

## Remove Default Example Code

After running `npx storybook@latest init`, delete all generated example/sample files before doing anything else. These typically include:

- The `stories/` folder at the project root (contains `Button.stories.ts`, `Header.stories.ts`, etc.)
- The `src/stories/` folder (some framework initializers place examples here)
- Any sample component files added by the initializer outside of `src/base/` or `src/icons/`

Keep only:

- `.storybook/` — the configuration directory
- The `storybook` and `build-storybook` scripts in `package.json`

```bash
rm -rf stories/ src/stories/
```

Do not leave example code in the repository.

## Configure Tailwind CSS

Update `.storybook/preview.ts` to import the library's global CSS file so Tailwind classes are available inside the Storybook canvas:

```ts
// .storybook/preview.ts
import '../src/styles/globals.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
```

> Adjust the CSS import path to match wherever the library's global stylesheet lives. This makes Tailwind utility classes available inside every story canvas.

## Install the a11y Addon

```bash
npx storybook add @storybook/addon-a11y
```

`@storybook/test` and `@storybook/addon-interactions` ship with Storybook 8+ by default — no separate install needed.
