# Story Patterns

## CSF3 Format

All stories use Component Story Format 3 (CSF3) with TypeScript.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        // shared defaults for all stories in this file
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Click me',
    },
};

export const Disabled: Story = {
    args: {
        label: 'Disabled',
        disabled: true,
    },
};
```

### Key Rules

- Import from `@storybook/react` — this library uses the Vite + React Storybook framework
- Use `satisfies Meta<typeof ComponentName>` and `type Story = StoryObj<typeof meta>` for strict typing
- Add `tags: ['autodocs']` to auto-generate a documentation page for the component
- Each named export is one story (one visual state of the component)
- Prefer shallow `args` over wrapper components — let Storybook controls work automatically

## Realistic Args

Use values that closely match real production usage:

- **Text**: Use actual copy, not placeholders like "foo", "test", or "Lorem ipsum"
- **Callbacks**: Use `fn()` from `@storybook/test` so interactions can be verified
- **Images/URLs**: Use relative paths to real assets or publicly available placeholder URLs

## Interaction Tests (play functions)

Use `userEvent` and `expect` from `@storybook/test` to simulate user interactions:

```tsx
import { expect, fn, userEvent, within } from '@storybook/test';

export const Clickable: Story = {
    args: {
        onClick: fn(),
        label: 'Submit',
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: /submit/i });

        await userEvent.click(button);

        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};
```

### play function guidelines

- Always `await` every `userEvent` call
- Use accessible queries (`getByRole`, `getByLabelText`) over `getByTestId`
- Test one behavior per story — create a new story for each interaction scenario
- Use `fn()` for callbacks so the Interactions panel in Storybook shows call history

## Accessibility (a11y)

The `@storybook/addon-a11y` addon runs automatically on all stories — no code needed for the default check. Add per-story configuration only when you need to suppress a known false positive:

```tsx
export const Default: Story = {
    parameters: {
        a11y: {
            config: {
                rules: [
                    // Only disable a rule when there is a documented reason
                    { id: 'color-contrast', enabled: false },
                ],
            },
        },
    },
};
```

Always fix real a11y violations in the component rather than suppressing them in the story.

## Story Naming Conventions

| Story name  | When to use                                           |
| ----------- | ----------------------------------------------------- |
| `Default`   | The standard, most-common usage                       |
| `Disabled`  | Disabled/inactive state                               |
| `Loading`   | Async loading state                                   |
| `Empty`     | Empty/zero-data state                                 |
| `WithError` | Error or validation state                             |
| `Mobile`    | Viewport-specific variant (use `parameters.viewport`) |

Use `PascalCase` for exported story names. The title uses slashes for grouping: `'Components/Forms/TextInput'`.
