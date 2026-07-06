---
name: gsd-workflow
description: GSD (Get Shit Done) spec-driven development. Context isolation, persistent state, phased execution. Prevents context rot in AI-assisted development.
allowed-tools: Read, Write, Edit, Glob, Grep
priority: HIGH
---

# GSD Workflow — Spec-Driven Development

> Ship faster by writing the plan before writing the code. Prevent context rot.

---

## 1. Core Problem: Context Rot

When AI agents work on multi-session tasks:
- Context window fills up → agent forgets decisions
- No persistent state → repeats mistakes
- No spec → drifts from requirements

**GSD Solution:** Move truth from volatile chat into durable files.

---

## 2. GSD Principles (Integrated into .agent/)

| Principle | Implementation |
|-----------|---------------|
| **Context Isolation** | Each task gets a fresh `{task-slug}.md` file |
| **Persistent State** | Decisions saved in task files, not chat history |
| **Spec-Driven** | Plan file IS the source of truth for implementation |
| **Phased Execution** | Initialize → Discuss → Plan → Execute → Verify |
| **Atomic Phases** | Each phase can run in a clean AI session |

---

## 3. GSD Phases

```
PHASE 1: INITIALIZE
├── Define project scope
├── Research existing code (CODEBASE.md)
└── Output: Problem statement in {task-slug}.md

PHASE 2: DISCUSS (Socratic Gate)
├── Ask strategic questions
├── Identify edge cases
└── Output: Requirements section in {task-slug}.md

PHASE 3: PLAN
├── Create technical spec
├── Break into atomic tasks
├── Map dependencies
└── Output: Implementation plan in {task-slug}.md

PHASE 4: EXECUTE
├── Implement task-by-task
├── Mark completed items ✅
├── Update {task-slug}.md after each task
└── Output: Working code + updated spec

PHASE 5: VERIFY
├── Run tests
├── Cross-check against spec
├── Update CHANGELOG
└── Output: Verified deliverable
```

---

## 4. Task File Structure

Every complex task creates `{task-slug}.md`:

```markdown
# Task: {Title}

## Status: IN_PROGRESS | COMPLETED | BLOCKED

## Context
- What problem are we solving?
- What exists today?

## Decisions Made
- [ ] Decision 1: Rationale
- [ ] Decision 2: Rationale

## Implementation Plan
- [ ] Task 1: Description
- [ ] Task 2: Description (depends on Task 1)

## Verification
- [ ] Tests pass
- [ ] No regressions
- [ ] Spec requirements met
```

---

## 5. Integration with Existing Workflows

| Existing Workflow | GSD Enhancement |
|---|---|
| `/plan` | Creates {task-slug}.md automatically |
| `/orchestrate` | Uses task file as coordination spec |
| `/create` | Phase 1-3 generate spec, Phase 4 builds |
| `/enhance` | Reads existing spec, extends it |
| Socratic Gate | Maps to GSD Phase 2 (Discuss) |

---

## 6. Context Recovery Protocol

When resuming work across sessions:

1. **Read** `{task-slug}.md` to restore context
2. **Check** completed vs pending tasks
3. **Verify** last task was properly finished
4. **Continue** from the next pending task

> 🔴 **Rule:** Never start coding without reading the task spec first.

---

## 7. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|------|
| Start coding without a plan | Write spec first |
| Keep decisions in chat only | Persist in task file |
| One giant implementation | Atomic phases |
| Assume context is retained | Re-read spec each session |
| Skip verification | Always run Phase 5 |

---

> **Remember:** The spec is the contract. Code that doesn't match the spec is wrong, not the spec.
