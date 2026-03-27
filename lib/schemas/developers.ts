import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { developers } from "@/db/schema";

export const developerSelectSchema = createSelectSchema(developers);
export const developerInsertSchema = createInsertSchema(developers, {
  name: (s) => s.min(1, "Name is required").max(100),
  capacityHours: (s) => s.min(1).max(80),
  // skillset is stored as a JSON string; validate as array before serialising
  skillset: z.array(z.string()).transform((arr) => JSON.stringify(arr)),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const developerUpdateSchema = developerInsertSchema.partial();

export type DeveloperSelect = z.infer<typeof developerSelectSchema>;
export type DeveloperInsert = z.infer<typeof developerInsertSchema>;
export type DeveloperUpdate = z.infer<typeof developerUpdateSchema>;
