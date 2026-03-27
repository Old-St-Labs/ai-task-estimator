/**
 * db/schema.ts
 *
 * Single source of truth for all table definitions.
 * Add new tables here — drizzle-zod will derive Zod schemas automatically.
 *
 * Convention:
 *   - Table names: snake_case plural  (e.g. user_stories)
 *   - Column names: snake_case        (e.g. created_at)
 *   - Export both the table AND its inferred TS types
 */

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// Projects — top-level container grouping stories, developers, and sprints
// ---------------------------------------------------------------------------

export const projects = sqliteTable("projects", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// ---------------------------------------------------------------------------
// Developers — team members with roles, skills, and sprint capacity
// ---------------------------------------------------------------------------

export const developers = sqliteTable("developers", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: int("project_id", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  role: text("role", {
    enum: ["frontend", "backend", "fullstack", "devops", "qa"],
  }).notNull(),
  /** JSON array of skill strings, e.g. '["React","Node.js","AWS"]' */
  skillset: text("skillset").notNull().default("[]"),
  /** Available hours per 2-week sprint — defaults to 70 */
  capacityHours: int("capacity_hours").notNull().default(70),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Developer = typeof developers.$inferSelect;
export type NewDeveloper = typeof developers.$inferInsert;

// ---------------------------------------------------------------------------
// User Stories — high-level requirements entered by the user
// ---------------------------------------------------------------------------

export const userStories = sqliteTable("user_stories", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: int("project_id", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  acceptanceCriteria: text("acceptance_criteria"),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] })
    .notNull()
    .default("medium"),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type UserStory = typeof userStories.$inferSelect;
export type NewUserStory = typeof userStories.$inferInsert;

// ---------------------------------------------------------------------------
// Sprints — 2-week blocks that contain tasks
// ---------------------------------------------------------------------------

export const sprints = sqliteTable("sprints", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: int("project_id", { mode: "number" }).notNull(),
  sprintNumber: int("sprint_number").notNull(),
  startDate: int("start_date", { mode: "timestamp" }),
  endDate: int("end_date", { mode: "timestamp" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Sprint = typeof sprints.$inferSelect;
export type NewSprint = typeof sprints.$inferInsert;

// ---------------------------------------------------------------------------
// Tasks — AI-generated sub-tasks derived from user stories
// ---------------------------------------------------------------------------

export const tasks = sqliteTable("tasks", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userStoryId: int("user_story_id", { mode: "number" }).notNull(),
  sprintId: int("sprint_id", { mode: "number" }),
  developerId: int("developer_id", { mode: "number" }),
  title: text("title").notNull(),
  description: text("description"),
  estimatedHours: int("estimated_hours"),
  status: text("status", {
    enum: ["pending", "in_progress", "done", "blocked"],
  })
    .notNull()
    .default("pending"),
  /** Layer hint used for sprint dependency ordering (e.g. "backend", "frontend", "infrastructure") */
  layer: text("layer"),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
