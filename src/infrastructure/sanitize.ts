export function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, 3000);
}

export function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s'\-.]/g, "")
    .trim()
    .slice(0, 60);
}
