---
name: project-setup
description: "Use when: setting up a new project from the nx-template-v2, converting a bare Next.js app to an Nx monorepo, running initial setup, scaffolding the project structure, or updating root config files to match the template. Fetches reference files from the nx-template-v2 GitHub repo main branch."
---

# Initial Setup — Nx Monorepo from nx-template-v2

## Overview

This skill migrates a bare Next.js project into a full Nx monorepo following the
[`Old-St-Labs/nx-template-v2`](https://github.com/Old-St-Labs/nx-template-v2) template.

**Always fetch reference files from the template's `main` branch** before applying them,
so the setup reflects the latest conventions. Use the raw GitHub URL pattern:

```
https://raw.githubusercontent.com/Old-St-Labs/nx-template-v2/main/<path>
```

---

## Reference Files to Fetch from Template

Fetch each of the following from the `main` branch and adapt to the current project name:

| File | Template Path |
|------|--------------|
| `package.json` | `package.json` |
| `nx.json` | `nx.json` |
| `tsconfig.base.json` | `tsconfig.base.json` |
| `eslint.config.js` | `eslint.config.js` |
| `jest.config.ts` | `jest.config.ts` |
| `jest.preset.js` | `jest.preset.js` |
| `vitest.workspace.ts` | `vitest.workspace.ts` |
| `project.json` | `project.json` |
| `tailwind-workspace-preset.js` | `tailwind-workspace-preset.js` |
| `.prettierrc` | `.prettierrc` |
| `.prettierignore` | `.prettierignore` |
| `.editorconfig` | `.editorconfig` |
| `.nvmrc` | `.nvmrc` |
| `.gitignore` | `.gitignore` |
| `commitlint.config.ts` | `commitlint.config.ts` |
| `.commitlintrc.json` | `.commitlintrc.json` |
| `lint-staged.config.js` | `lint-staged.config.js` |
| `.husky/commit-msg` | `.husky/commit-msg` |
| `.husky/pre-commit` | `.husky/pre-commit` |
| `.husky/pre-push` | `.husky/pre-push` |
| `.husky/prepare-commit-msg` | `.husky/prepare-commit-msg` |
| `apps/web-app/project.json` | `apps/web-app/project.json` |
| `apps/web-app/next.config.js` | `apps/web-app/next.config.js` |
| `apps/web-app/tsconfig.json` | `apps/web-app/tsconfig.json` |
| `apps/web-app/tsconfig.spec.json` | `apps/web-app/tsconfig.spec.json` |
| `apps/web-app/tailwind.config.js` | `apps/web-app/tailwind.config.js` |
| `apps/web-app/postcss.config.js` | `apps/web-app/postcss.config.js` |
| `apps/web-app/eslint.config.js` | `apps/web-app/eslint.config.js` |
| `apps/web-app/jest.config.ts` | `apps/web-app/jest.config.ts` |
| `apps/web-app/next-env.d.ts` | `apps/web-app/next-env.d.ts` |
| `apps/web-app/index.d.ts` | `apps/web-app/index.d.ts` |
| `apps/user/user-api-service/project.json` | `apps/user/user-api-service/project.json` |
| `apps/user/user-api-service/tsconfig.json` | `apps/user/user-api-service/tsconfig.json` |
| `apps/user/user-api-service/tsconfig.app.json` | `apps/user/user-api-service/tsconfig.app.json` |
| `apps/user/user-api-service/tsconfig.spec.json` | `apps/user/user-api-service/tsconfig.spec.json` |
| `apps/user/user-api-service/jest.config.ts` | `apps/user/user-api-service/jest.config.ts` |
| `apps/user/user-api-service/webpack.config.js` | `apps/user/user-api-service/webpack.config.js` |
| `apps/user/user-api-service/src/main.ts` | `apps/user/user-api-service/src/main.ts` |
| `apps/user/user-api-service/src/app/app.controller.ts` | `apps/user/user-api-service/src/app/app.controller.ts` |
| `apps/user/user-api-service/src/app/app.module.ts` | `apps/user/user-api-service/src/app/app.module.ts` |
| `apps/user/user-api-service/src/app/app.service.ts` | `apps/user/user-api-service/src/app/app.service.ts` |

---

## Step-by-Step Execution

### Step 1 — Confirm Project Details

Before starting, confirm with the user:
- **Project name** (e.g. `ai-task-estimator`) — used to replace `@nx-template-v3/source` in `package.json` and `project.json`
- **App service name** (e.g. `task-estimator-api-service`) — the NestJS API service under `apps/<domain>/`
- **App service domain folder** (e.g. `task-estimator`) — the parent folder under `apps/`
- **Service port** (default: `4025`)
- **Keep files**: `AGENTS.md`, `CLAUDE.md` must never be removed

### Step 2 — Remove Old Root-Level Files

Delete files from the bare Next.js scaffold that will be replaced:

```
eslint.config.mjs
postcss.config.mjs
next.config.ts
tsconfig.json
app/          (entire directory)
```

Do NOT remove: `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `README.md`, `package-lock.json` (remove after yarn install).

### Step 3 — Fetch & Apply Root Config Files

Fetch each file listed in the **Reference Files** table above from:
```
https://raw.githubusercontent.com/Old-St-Labs/nx-template-v2/main/<path>
```

Apply these substitutions to every fetched file:

| Template value | Replace with |
|----------------|-------------|
| `@nx-template-v3/source` | `@<project-name>/source` |
| `user-api-service` | `<service-name>` |
| `apps/user/user-api-service` | `apps/<domain>/<service-name>` |
| `dist/apps/user/user-api-service` | `dist/apps/<domain>/<service-name>` |
| `USER-API-SERVICE` | `<SERVICE-NAME>` (uppercase) |

For `package.json`:
- Keep only the build scripts relevant to the services in this project
- Remove all unrelated service build scripts from the template

For `tsconfig.base.json`:
- Keep only the `paths` aliases relevant to this project
- Remove unused library path aliases

For `nx.json`:
- Remove project-specific excludes from the jest plugin that reference template project names

### Step 4 — Create apps/web-app Base Structure

Create the following directory skeleton (config files only, minimal src stubs):

```
apps/web-app/
├── project.json
├── next.config.js
├── tsconfig.json
├── tsconfig.spec.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── jest.config.ts
├── next-env.d.ts
├── index.d.ts
├── public/
└── src/           ← empty, do not copy template source files
```

The `tailwind.config.js` **presets** array should only include `../../tailwind-workspace-preset.js`
(omit `components-web` tailwind config — that lib does not exist in this project).

`src/` should be created as an **empty directory** — do not copy any source files from the template's `apps/web-app/src/`. The application code is project-specific and will be built separately.

### Step 5 — Create apps/\<domain\>/\<service-name\> Structure

Fetch reference files from `apps/user/user-api-service/` in the template.
Apply name substitutions from Step 3.

**Important constraints:**
- Include ONLY: `app.controller.ts`, `app.module.ts`, `app.service.ts`
- Do NOT include: `users/` module, commands, queries, `user.controller.ts`
- `app.module.ts` imports array should start empty — no `UserModule`, `ConfigurationLibModule`

Directory structure:
```
apps/<domain>/<service-name>/
├── project.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── jest.config.ts
├── webpack.config.js
└── src/
    ├── main.ts
    ├── assets/
    │   ├── .gitkeep
    │   └── version.dat   (content: "0.0.1")
    └── app/
        ├── app.controller.ts
        ├── app.module.ts
        └── app.service.ts
```

### Step 6 — Create Root .env.local

Create `.env.local` at the **workspace root** (not inside the app folder):

```env
SERVICE_TRIGGER=LOCALHOST
PORT=<service-port>
```

Nx automatically loads `.env.local` from the workspace root for all project executors.
This sets `SERVICE_TRIGGER=LOCALHOST` which triggers `bootstrapServer()` in `main.ts`.

### Step 7 — Install Dependencies

Remove `package-lock.json` if present, then run:

```bash
yarn install
```

Warn the user that peer dependency warnings from `@typescript-eslint`, `eslint-config-next`,
and `webpack-cli` are expected and non-blocking.

### Step 8 — Verify

Run the following to confirm everything works:

```bash
# Build
npx nx build <service-name>

# Serve (reads SERVICE_TRIGGER from .env.local)
npx nx serve <service-name>
```

Expected serve output:
```
🚀 <SERVICE-NAME> is running on: http://localhost:<port>/api
🚀 <SERVICE-NAME> Swagger Endpoint : http://localhost:<port>/api/swagger
```

If the process exits with code 0 immediately, check that `.env.local` exists at the workspace
root with `SERVICE_TRIGGER=LOCALHOST`.

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Process exited with code 0` immediately on serve | `SERVICE_TRIGGER` not set | Ensure `.env.local` at workspace root has `SERVICE_TRIGGER=LOCALHOST` |
| `Cannot find module '@configuration-lib'` | Template lib path alias copied without the lib | Remove unused `paths` from `tsconfig.base.json` and unused imports from `app.module.ts` |
| `Project 'user-api-service' does not exist` | Stale Nx cache | Run `npx nx reset` then retry |
| Nx can't find project | `project.json` `name` field doesn't match | Ensure `name` in `project.json` matches the service folder name exactly |
| `yarn workspaces` warning | Root `package.json` not `private: true` | Ensure `"private": true` is set |
