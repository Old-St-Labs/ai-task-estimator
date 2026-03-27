import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userStories } from "@/db/schema";

export const userStorySelectSchema = createSelectSchema(userStories);
export const userStoryInsertSchema = createInsertSchema(userStories, {
  title: (s) => s.min(1, "Title is required").max(200),
  description: (s) => s.min(1, "Description is required"),
  acceptanceCriteria: (s) => s.optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const userStoryUpdateSchema = userStoryInsertSchema.partial();

export type UserStorySelect = z.infer<typeof userStorySelectSchema>;
export type UserStoryInsert = z.infer<typeof userStoryInsertSchema>;
export type UserStoryUpdate = z.infer<typeof userStoryUpdateSchema>;
