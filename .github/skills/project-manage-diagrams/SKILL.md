---
name: project-manage-diagrams
description: "Use when: creating, updating, or reviewing draw.io diagrams for this project. Covers: editing the main AI Task Estimator flow diagram, adding or updating per-service endpoint diagrams for any app under apps/ (excluding web-app), and keeping all diagrams in sync with code changes. Trigger phrases: 'update diagram', 'add diagram', 'diagram for <service>', 'show endpoint flow', 'create drawio', 'sync diagrams'."
---

# Manage Diagrams — AI Task Estimator

## Overview

All diagrams live in `docs/` as `.drawio` files and are opened natively in VS Code via the
[`hediet.vscode-drawio`](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
extension.

There are two categories of diagram:

| Category | File | Description |
|----------|------|-------------|
| **Main flow** | `docs/ai-task-estimation-flow.drawio` | End-to-end user-facing product flow |
| **Service diagrams** | `docs/<domain>/<service-name>-endpoints.drawio` | Per-service endpoint map |

**Rules:**
- `web-app` is a frontend and must **never** have a service diagram.
- Every new NestJS service added under `apps/` (any domain, any name) **must** get its own service diagram.
- Diagram files must use `.drawio` extension only (not `.drawio.svg` or `.drawio.png`).

---

## Diagram 1 — Main Flow (`docs/ai-task-estimation-flow.drawio`)

### Purpose
Shows the complete product journey from the user's perspective. Always kept as a single-page
`<mxfile>` with one `<diagram>` element.

### Current Flow (as of initial project setup)

```
Start
  └─► User Inputs Task Name
        └─► Save Task to JSON File (Database)
              └─► AI Evaluates Task Complexity & Scope
                    └─► AI Returns Estimate (e.g. 4–8 hrs)
                          └─► Display Estimate to User
                                └─► [diamond] User Wants to Adjust?
                                      ├─ No  ──► Save Final Estimate to JSON File ──► End
                                      └─ Yes ──► User Manually Adjusts Estimated Hours
                                                        └─► Save Final Estimate to JSON File ──► End
```

### When to Update This Diagram
Update whenever any of the following change:
- A new user-facing step is added to or removed from the product
- The AI estimation logic changes in a way that affects the user journey
- The data persistence strategy changes (e.g. JSON file → database)
- The review/adjustment flow changes

### Shape & Style Conventions

| Node type | draw.io style | Colour |
|-----------|--------------|--------|
| Start / End | `ellipse` | green fill `#d5e8d4` / stroke `#82b366` |
| User action (input, display, adjust) | `rounded=1` rectangle | blue fill `#dae8fc` / stroke `#6c8ebf` |
| AI action | `rounded=1` rectangle | yellow fill `#fff2cc` / stroke `#d6b656` |
| Decision | `rhombus` | red fill `#f8cecc` / stroke `#b85450` |
| Data store (JSON / DB) | `shape=cylinder3` | light grey fill `#f5f5f5` / stroke `#666666` |
| Edges | `edgeStyle=orthogonalEdgeStyle` on branching edges; plain on straight paths | — |

### Editing the Main Flow

1. Open `docs/ai-task-estimation-flow.drawio` in VS Code (draw.io opens automatically).
2. Edit visually in the editor **or** edit the XML directly.
3. When editing XML directly, keep the `<mxfile>` → `<diagram>` → `<mxGraphModel>` → `<root>` hierarchy intact.
4. Cell IDs must be unique integers within the file. Start new cells from the highest existing ID + 1.
5. After editing, confirm the file parses correctly by re-opening in VS Code.

---

## Diagram 2 — Per-Service Endpoint Sequence Diagrams

### Location

All service sequence diagrams live as **additional pages** inside `docs/ai-task-estimation-flow.drawio`.
Each service gets its own `<diagram>` element (tab/page) named after the service.

**Never** create a separate `.drawio` file per service.

### Purpose
A **UML sequence diagram** showing the high-level flow for every HTTP endpoint in the service:

```
User (FE) → Controller → Service → [External Dependency]
                                           ↓
User (FE) ← 200 OK + response body ←──────┘

User (FE) ← 500 / 4xx ←── Controller ←── Service (error thrown)
```

Participants (left to right):
1. **User (FE)** — the frontend / HTTP caller
2. **Controller** — the NestJS controller (named after the service)
3. **Service class(es)** — e.g. AppService, TaskService
4. **External dependencies** — FileSystem, AI Provider, DynamoDB, S3, etc.

One **page (`<diagram>`)** per service. If the service has multiple controllers, stack their
endpoints vertically within the same page separated by a horizontal dashed divider line.

### Layout Rules
- Participants are **horizontal boxes** at the top with dashed **lifelines** going straight down.
- Each endpoint occupies a vertical band:
  - **Section label** (bold text) at the top of the band
  - **Activation bars** (thin colored rectangles) on the lifelines
  - **Request arrows** — solid, filled arrowhead (`endArrow=block;endFill=1`)
  - **Return arrows** — dashed, open arrowhead (`endArrow=open;endFill=0;dashed=1`)
- **Error paths** are shown immediately below the happy path for the same endpoint.
  - Preceded by a red italic label (e.g. `Error: <reason>`)
  - Arrow styled with `strokeColor=#b85450;fontColor=#b85450`
  - Error response: `500 Internal Server Error` or appropriate 4xx
- A **horizontal dashed separator** (`endArrow=none;dashed=1;strokeColor=#cccccc`) divides endpoints.

### How to Build a Service Diagram

**Step 1 — Discover all endpoints**

Read the service's controller files:
```
apps/<domain>/<service-name>/src/app/**/*.controller.ts
```

For each controller collect:
- Class name
- Each method: HTTP verb (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`), route path, method name

**Step 2 — Discover service methods called by each endpoint**

Read the corresponding `*.service.ts` files. For each controller method, trace which service
method it calls and what that method does (reads file, calls AI, writes file, etc.).

**Step 3 — Identify external dependencies**

Look for any of the following in service methods and annotate them in the diagram:
- File system reads/writes (`fs.readFile`, `fs.writeFile`, `fs.readFileSync`, etc.)
- HTTP calls (`axios`, `fetch`, `HttpService`)
- AWS SDK clients (`DynamoDB`, `S3`, `SES`, etc.)
- AI provider calls (OpenAI, Anthropic, Bedrock, etc.)
- Database ORM calls (`dynamodb-onetable`, Prisma, TypeORM, etc.)

**Step 4 — Build the diagram XML**

Use this template for each endpoint group, creating one `<diagram>` page per controller:

```xml
<mxfile host="vscode-drawio" version="21.0.0">
  <diagram name="<ControllerClassName>" id="<controller-class-name>">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1"
                  connect="1" arrows="1" fold="1" page="1" pageScale="1"
                  pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- cells here — see shape conventions below -->
      </root>
    </mxGraphModel>
  </diagram>
  <!-- add more <diagram> elements for additional controllers -->
</mxfile>
```

### Shape & Style Conventions for Sequence Diagrams

| Element | draw.io style | Colour |
|---------|--------------|--------|
| User (FE) participant | `ellipse` | light grey fill `#f5f5f5` / stroke `#666666` |
| Controller participant | `rounded=1` rectangle | blue fill `#1e88e5` / stroke `#1565c0`, white text |
| Service class participant | `rounded=1` rectangle | teal fill `#00acc1` / stroke `#006064`, white text |
| External dependency participant | `rounded=1` rectangle | green fill `#7cb342` / stroke `#558b2f`, white text |
| Lifeline | `endArrow=none;dashed=1;strokeColor=#aaaaaa` vertical edge (fixed `sourcePoint`/`targetPoint`) | — |
| Activation bar | plain rectangle, same fill/stroke as its participant | width=16 |
| Request message | `endArrow=block;endFill=1;edgeStyle=none` horizontal edge | dark label |
| Return message | `endArrow=open;endFill=0;dashed=1;edgeStyle=none` horizontal edge | dark label |
| Error label | `text` cell, `fillColor=#fff0f0;fontColor=#b85450;fontStyle=2` (italic) | — |
| Error request | `endArrow=block;endFill=1;strokeColor=#b85450;fontColor=#b85450` | red |
| Error return | `endArrow=open;endFill=0;dashed=1;strokeColor=#b85450;fontColor=#b85450` | red |
| Section label | `text;fontStyle=1` (bold) above each endpoint group | — |
| Endpoint separator | `endArrow=none;dashed=1;strokeColor=#cccccc` horizontal edge | — |

### Updating a Service Diagram

Trigger: any of the following changes in the service code:
- A new controller method / endpoint is added
- An existing endpoint's route, verb, or service call changes
- A new external dependency is introduced (new file I/O, new AI call, new AWS SDK usage)
- An endpoint is deleted

Steps:
1. Re-read the affected `*.controller.ts` and `*.service.ts`.
2. Open `docs/ai-task-estimation-flow.drawio` and locate the service's `<diagram>` page.
3. Add / modify / remove cells as needed.
   - New cells get IDs that are higher than the current maximum in that `<diagram>`.
   - Keep existing cell IDs unchanged where possible.
4. For a new endpoint, insert it below the last existing endpoint, preceded by a new separator line.

---

## Step-by-Step: Add a Brand New Service Page

Use this when a new NestJS service is added to `apps/<domain>/`.

1. **Read source files** — scan all `*.controller.ts` and `*.service.ts` under `apps/<domain>/<service-name>/src/`.
2. **Map endpoints** — list every `@Get / @Post / @Put / @Patch / @Delete` with its path, the service method it calls, return type, and any external dependencies.
3. **Open** `docs/ai-task-estimation-flow.drawio` and append a new `<diagram>` element inside `<mxfile>` (after the last `</diagram>`).
   - `name` = the service name (e.g. `task-estimator-api-service`)
   - `id` = same value (kebab-case, unique across the file)
4. **Build the sequence diagram** inside the new `<diagram>` following the layout and style conventions above.
   - Cell IDs within this diagram start at `100` (they're scoped per `<diagram>`, so no global conflict).
5. **Verify** — open the file in VS Code and confirm the new tab renders without errors.

---

## Current Service Diagrams

### `task-estimator-api-service`

Page: second `<diagram>` tab in `docs/ai-task-estimation-flow.drawio`

Endpoints (as of initial setup):

| Method | Route | Controller method | Service method | Happy response | Error |
|--------|-------|-------------------|----------------|----------------|-------|
| GET | `/api` | `healthCheck()` | `AppService.healthCheck()` → `getVersion()` | `200 { status: 'ok', version }` | `500` if `version.dat` not found |
| GET | `/api/version` | `getVersion()` | `AppService.getVersion()` | `200 { version }` | `500` if `version.dat` not found |

`AppService.getVersion()` reads `src/assets/version.dat` from the filesystem.

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| draw.io extension doesn't open `.drawio` file | Extension not installed | Install `hediet.vscode-drawio` |
| File renders blank | Malformed `<mxfile>` XML | Check that `<root>` contains `<mxCell id="0"/>` and `<mxCell id="1" parent="0"/>` as first two cells |
| Duplicate cell IDs cause graph corruption | Copy-pasted cell blocks with same IDs | Renumber all IDs to be unique across the entire file |
| New service has no diagram | Diagram wasn't added during service creation | Follow "Create a Brand New Service Diagram" steps above |
