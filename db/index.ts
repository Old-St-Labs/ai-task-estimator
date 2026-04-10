/**
 * db/index.ts
 *
 * Single Drizzle client instance shared across the entire app.
 * better-sqlite3 runs fully in-process — no external daemon required.
 *
 * The DB file is created automatically at `local.db` on first run.
 * Add `local.db` to .gitignore to avoid committing development data.
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("local.db");

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
