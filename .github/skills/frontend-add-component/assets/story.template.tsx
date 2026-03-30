/**
 * Story template — replace every occurrence of `ComponentName` with the real component name.
 * Delete commented-out sections you don't need.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentName } from './ComponentName';

const meta = {
    title: 'Components/ComponentName',
    component: ComponentName,
    tags: ['autodocs'],
    args: {
        // Shared defaults for all stories — use realistic values
    },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default Story ────────────────────────────────────────────────────────────

export const Default: Story = {
    args: {
        // Provide realistic args here
    },
};

// ─── Additional Visual States ─────────────────────────────────────────────────

// export const Disabled: Story = {
//   args: {
//     disabled: true,
//   },
// };

// export const Loading: Story = {
//   args: {
//     loading: true,
//   },
// };

// ─── Interaction Test ─────────────────────────────────────────────────────────

// export const WithInteraction: Story = {
//   args: {
//     onClick: fn(),
//   },
//   play: async ({ args, canvasElement }) => {
//     const canvas = within(canvasElement);
//     const element = canvas.getByRole('button');
//
//     await userEvent.click(element);
//
//     await expect(args.onClick).toHaveBeenCalledOnce();
//   },
// };
