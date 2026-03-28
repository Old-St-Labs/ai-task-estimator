---
name: requirements
description: Requirements elicitation framework. Defines how to gather specs, acceptance criteria, and edge cases before any planning or implementation begins. Activate when a feature request is vague, large, or missing acceptance criteria.
---

# Requirements Elicitation — AI Task Estimator

## When to Apply

Run requirements gathering before planning or implementing when the request is missing any of:
- A concrete description of what the user experiences after the change
- At least one testable acceptance criterion
- How error/edge cases should behave

**Skip for:** bug fixes with obvious expected behaviour, refactors, questions, code reviews, tasks scoped to a single file with clear intent.

---

## The Minimum Viable Spec

A request is ready to implement when it answers all three:

| Must-have | Question it answers |
|-----------|-------------------|
| **What** | What visible change does the user experience? |
| **Acceptance criteria** | How do we know it's done? (1–3 testable statements) |
| **Error / edge cases** | What happens when something goes wrong or data is missing? |

---

## Question Bank — Ask by Gap

Don't ask every question. Identify which gaps exist, then ask only those. One gap at a time.

### Gap: What exactly changes?
- What does the user see or do that they can't do today?
- What page or section does this appear in?
- Is this a new page, a new section, or a change to existing UI?
- Is there a reference design — mock, screenshot, or URL — to follow?

### Gap: Why / priority
- What problem does this solve?
- What's the impact if it isn't built?
- Is this blocking anything else?

### Gap: Acceptance criteria
- What are 2–3 specific things that must be true for this to be "done"?
- Can you walk through the happy path step by step?
- What does done look like from the user's perspective?

### Gap: Data / persistence
- Does this need to read or write any data?
- Should state survive a page reload?
- Does it relate to existing data — tasks, estimates, team members?

### Gap: UI / design details
- What should the loading state look like?
- What should the error state look like?
- Are there specific existing components to match?
- Any layout constraints — modal, full page, inline, sidebar?

### Gap: Edge cases
- What happens with no data or an empty list?
- What if the AI call fails or times out?
- What if the user submits invalid or empty input?
- Are there min/max limits (e.g. max number of team members)?

### Gap: Access / security
- Is this visible to all users or restricted?
- Does any user input get sent to the AI? (triggers sanitization requirement)

---

## Spec Template

Fill this out collaboratively with the user before producing a plan:

```
## Feature Spec: [Name]

### What
[1–2 sentences: what the user experiences after this is built]

### Why
[Problem or user need being addressed]

### Acceptance Criteria
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]

### UI / Interaction
- Location: [page / section / component]
- Loading state: [describe or "N/A"]
- Empty state: [describe or "N/A"]
- Error state: [describe or "N/A"]
- Reference design: [URL, Figma, screenshot, or "none"]

### Data
- Reads: [what data is consumed]
- Writes: [what is created/modified, or "display-only"]
- Persistence: [session / server-side / none]

### Edge Cases
- [describe edge case]
- [describe edge case]

### Out of Scope
- [explicitly list what this feature does NOT cover]
```

---

## "Definition of Ready" Checklist

Before producing a plan or writing any code, confirm:

- [ ] What the user sees/does is described concretely (not "it should work better")
- [ ] At least 2 acceptance criteria written as testable Given/When/Then statements
- [ ] Loading and error states addressed (even if the answer is "N/A")
- [ ] Data requirements clear — read-only vs. write, persistent vs. ephemeral
- [ ] Out-of-scope items listed to prevent scope creep

If any item is unchecked: **ask, don't assume**.

---

## How to Elicit (Conversational Rules)

1. **Reflect back first** — "It sounds like you want X. Is that right?" — confirms intent before drilling in.
2. **One gap at a time** — don't fire 8 questions at once. Identify the biggest gap and ask that first.
3. **Propose defaults for low-stakes choices** — "I'll assume loading shows a spinner and errors use the existing red banner pattern — ok?" This moves things forward without blocking.
4. **Fill the spec template as answers arrive** — show the user the filled-in spec for confirmation before moving to planning.
5. **Hard gate** — do not produce a plan or write any code until the Definition of Ready checklist passes.

---

## Anti-Patterns

- **Assuming intent** — "I'll build it as a modal" when modal vs. inline page wasn't specified
- **Skipping error states** — always address them; "show a generic error" is a valid, accepted answer
- **Vague acceptance criteria** — "it should feel smooth" is not a criterion
- **Over-eliciting** — never block progress on cosmetic choices that have an obvious default
- **Starting implementation during elicitation** — no code until spec is confirmed
