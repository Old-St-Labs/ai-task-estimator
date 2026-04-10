# AI Setup — 5-Minute Overview
## AI Task Estimator · For PMs, BAs, QAs & Leadership

---

## Slide 1 — The Problem with AI Assistants Today

**You've probably seen this:**
- A developer asks the AI to build something — it ignores the team's agreed conventions
- The AI gives a different answer to the same question tomorrow
- It makes changes that break things in other parts of the product
- Every new session, it starts from zero — no memory of past decisions

**The root cause:** AI assistants are powerful, but they're not set up to know *your* product.

**What we built:** A structured way to give the AI the context it needs — once — so it behaves like a knowledgeable, consistent team member.

---

## Slide 2 — The Approach: Roles, Rules, and Memory

Think of the AI setup like onboarding a new contractor:

| What you give a new contractor | What we give the AI |
|-------------------------------|---------------------|
| Company handbook (key rules) | `copilot-instructions.md` — always-on rules |
| Specialist colleagues to ask | Named AI agents for UI, backend, testing, security |
| Reference docs (look these up when needed) | Skills — loaded on demand, not always |
| Project history & past decisions | `project.memory.md` — institutional memory |
| "Check with a human before going live" | Requirements gate — AI must confirm spec before building |

The AI is never just one chatbot. It's a structured team of specialised roles.

---

## Slide 3 — The Team of AI Agents

Each agent has a defined job and scope. Some can make changes; others can only read and report.

| Agent | What it does | Can it change code? |
|-------|-------------|:-------------------:|
| **Orchestrator** | Single entry point — takes every request, decides who handles it | ✅ for simple tasks |
| **Frontend** | UI, screens, styling | ✅ |
| **Backend** | Data, logic, AI integration | ✅ |
| **Refactor** | Improves code structure without changing how it behaves | ✅ |
| **E2E** | Automated end-to-end tests | ✅ |
| **Code Review** | Audits code against project standards — read only | ❌ |
| **Security** | Checks for vulnerabilities — read only | ❌ |
| **UX** | Reviews usability and accessibility — read only | ❌ |

**Why does this matter to you?**
When a developer asks for a new feature, the AI automatically routes security and UX checks to agents that *cannot* accidentally make changes. Reviews stay reviews.

---

## Slide 4 — The Requirements Gate

**The most important safeguard in the whole setup.**

Before the AI writes a single line of code for any new feature, it is required to confirm three things:

1. **What** — what will the user actually see or do?
2. **Done means done** — what are the acceptance criteria?
3. **What can go wrong** — how should errors and edge cases behave?

If any of these is missing, the AI **stops and asks** — it does not guess, it does not proceed.

> This directly reduces the "we built the wrong thing" problem.
> Vague requests like "improve the form" or "add a dashboard" are blocked until the spec is clear.

For complex features, the AI presents a phased plan and **waits for human sign-off** before starting work.

---

## Slide 5 — Memory: What the AI Knows About This Product

Three documents permanently inform every AI session:

**Project Context** — what the product does, the core data model, and business rules
> e.g. "Confidence below 50% should prompt the user to add more detail"

**File Map** — a lookup table: "to work on feature X, look in file Y"
> Prevents the AI from wandering through the codebase blindly

**Project Memory** — decisions made, problems already solved, things that were tried and abandoned
> e.g. "We changed AI provider; only the environment variable needs updating, not the code"
> e.g. "A generic developer agent was created and then deleted — the orchestrator covers it"

The team updates these documents. The AI reads them every session.

---

## Slide 6 — What This Means for the Team

| Role | How this helps you |
|------|--------------------|
| **PM / BA** | Requirements gate means the AI won't build before the spec is clear. Fewer surprises in sprint review. |
| **QA** | A dedicated testing agent knows the test strategy. Security and UX agents flag issues before QA even sees the build. |
| **CEO / Leadership** | Consistent, auditable AI behaviour. Security checks are structural — not optional. Cost is managed (AI only loads context it needs). |
| **Developers** | No need to re-explain the codebase every session. Past decisions are recorded and respected. |

**The one-line summary:**
> We gave the AI a job description, a handbook, specialist colleagues, and a memory — so it works like part of the team, not a random chatbot.

---

*Based on the live AI setup in this repository.*
