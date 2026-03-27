/**
 * lib/skillset.ts
 * Helpers for serialising/deserialising the developer skillset JSON field.
 */

/** Parse a skillset JSON string into a string array */
export function parseSkillset(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fall back to comma-separated
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Serialize a comma-separated skill string into a JSON array string for DB storage */
export function serializeSkillset(raw: string): string {
  const skills = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return JSON.stringify(skills);
}
