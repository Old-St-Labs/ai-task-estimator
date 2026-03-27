---
name: ai-setup
description: PROSE-compliant AI setup patterns for this codebase. Covers writing agents (.md with YAML frontmatter), skills (SKILL.md), and scoped instructions (.instructions.md). Activate when creating, editing, or reviewing any file in .github/agents/, .github/skills/, .github/instructions/, or .github/prompts/.
---

# AI Setup Patterns — PROSE for AI Task Estimator

> Reference: [PROSE specification](https://danielmeppiel.github.io/awesome-ai-native/docs/prose/)

## Project AI Structure

```
.github/
├── copilot-instructions.md     ← SHORT global entry point (auto-loaded)
├── agents/                     ← .md files with YAML frontmatter
├── instructions/               ← .instructions.md with applyTo patterns
├── prompts/                    ← .prompt.md agentic workflows
├── skills/                     ← folders, each containing SKILL.md
└── ai/
    ├── PROJECT_CONTEXT.md        ← domain model and business rules
    └── file-map.md               ← navigation index (update when adding files)
```

---

## Writing an Agent

Location: `.github/agents/<name>.md`

### Required YAML Frontmatter

```markdown
---
description: One sentence explaining what this agent does and when to invoke it. Used for @-discovery.
applyTo: "glob/pattern/**"
tools: ["codebase", "editFiles", "search", "problems", "usages"]
model: Claude Sonnet 4
---
```

### `tools` Reference (Safety Boundaries)

| Tool | Effect | Grant when |
|------|--------|------------|
| `codebase` | Semantic search | All agents |
| `search` | Text search | All agents |
| `usages` | Find symbol references | All agents |
| `problems` | Read lint/TS errors | All agents |
| `changes` | See git diff | Agents that need context of recent changes |
| `editFiles` | Create/modify files | Agents that write code |
| `runCommands` | Run shell commands | Only agents that need to build/lint/test |
| `terminalLastCommand` | Read last terminal output | Debugging/validation agents |

**Orchestrators and read-only agents must NOT include `editFiles` or `runCommands`.**

### Agent Body Structure

```markdown
# Agent Name

## Role
One paragraph: what the agent does, what it must not do.

## Boundaries
- CAN: [explicit list]
- CANNOT: [explicit list]

## Context — Load on Demand
Links to skills and instructions, loaded only when relevant to the task.

## [Domain-specific sections]
Patterns, decision trees, examples.

## Implementation Checklist
- [ ] item
```

### Agent Anti-Patterns to Avoid

- **Too broad:** `applyTo: "**/*"` — loads for every file, pollutes context
- **No boundaries:** omitting CANNOT list leaves the agent scope undefined
- **Inline knowledge:** embedding what should be a skill directly in the agent body (makes it non-reusable)
- **Missing checklist:** without a checklist, the agent has no quality gate
- **Model not set:** always specify `model: Claude Sonnet 4` to avoid default model surprises

---

## Writing a Skill

Location: `.github/skills/<name>/SKILL.md` (one folder per skill)

### Required YAML Frontmatter

```markdown
---
name: skill-name
description: One sentence — what this skill covers and when an agent should load it.
---
```

### Skill Body Structure

```markdown
# Skill Title

## [Subsection 1]
Concrete patterns, code examples, rules.

## [Subsection 2]
...

## Checklist
- [ ] validation item
```

### What Belongs in a Skill vs. an Agent

| Put in a Skill when | Put in an Agent when |
|---------------------|---------------------|
| Multiple agents need the same knowledge | It's decision-making logic for one domain |
| It's reference/pattern content | It's a role description with boundaries |
| It could be reused in another project | It's specific to this repo's workflow |
| Framework patterns, API signatures | Routing tables, approval rules |

### Skill Anti-Patterns to Avoid

- **Monolithic skill:** one massive skill for everything — split by domain
- **Agent logic in a skill:** skills are referenced knowledge, not role definitions
- **No examples:** abstract rules without code examples fail in practice
- **Stale content:** skills must stay current with the codebase they describe

---

## Writing a Scoped Instruction

Location: `.github/instructions/<name>.instructions.md`

### Required YAML Frontmatter

```markdown
---
applyTo: "app/**/*.tsx"
description: Short description of what rules this applies.
---
```

### `applyTo` Pattern Examples

| Pattern | Loads for |
|---------|----------|
| `**/*.{ts,tsx}` | All TypeScript files |
| `app/**/*.tsx` | All TSX in app/ |
| `app/**/actions.ts` | Only Server Action files |
| `**/*.css` | CSS/style files |
| `app/**/_components/**` | Feature-local components only |

### Instruction Content Rules

- Keep to ONE domain per file (e.g., TypeScript conventions are separate from RSC rules)
- Be prescriptive and specific: "Use `type`, not `interface`" not "consider using type"
- Include both the rule AND the reason
- Always add a code example showing correct vs. incorrect

---

## Writing a Prompt Workflow

Location: `.github/prompts/<name>.prompt.md`

### Required YAML Frontmatter

```markdown
---
mode: agent
description: What workflow this executes.
tools: ["codebase", "editFiles", "search"]
---
```

### Required Sections

1. **Context Loading Phase** — which files/skills to read before doing anything
2. **Phased execution** — numbered steps (plan, implement, validate)
3. **Human Validation Gate** — at least one `🚨 STOP` before destructive or large changes
4. **Checklist** — validation items at the end

---

## Updating Indexes (Required After Every Change)

After creating or renaming any AI setup file, update **both**:

1. `.github/ai/file-map.md` — add to the Skills or Agents table
2. `.github/copilot-instructions.md` — add to Context table (skills) or Agents table
3. `AGENTS.md` — add to the structure tree and Quick Start if warranted

Failure to update indexes violates Progressive Disclosure — agents won't know the new primitive exists.

---

## PROSE Compliance Checklist for New Primitives

- [ ] Agent has explicit `tools` list (Safety Boundaries)
- [ ] Agent has `applyTo` scoped to its domain (Explicit Hierarchy)
- [ ] Agent references skills via links, not by embedding content (Progressive Disclosure)
- [ ] Skill is focused on one domain; split if covering 2+ unrelated areas (Reduced Scope)
- [ ] Instruction has `applyTo` pattern that limits its activation scope (Explicit Hierarchy)
- [ ] All indexes updated: `file-map.md`, `copilot-instructions.md`, `AGENTS.md` (Grounding)
