/**
 * lib/cn.ts
 * Utility for conditional Tailwind class merging.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
