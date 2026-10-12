---
name: full-codebase-audit
description: >-
  Performs a comprehensive, read-only codebase audit using two parallel subagents
  that inspect files in batches of 20. Produces a structured audit report and an
  actionable coding-phase prompt listing every issue with its location, severity,
  and recommended fix. This skill NEVER edits or deletes any file.
---

# Full Codebase Audit — Orchestration Skill

> **CARDINAL RULE**: This skill is **READ-ONLY**. No file may be created,
> edited, overwritten, or deleted inside the audited repository. The only
> outputs are artifact markdown files written to the conversation's artifact
> directory.

---

## 1. Purpose

Run a thorough, multi-dimensional audit of an entire codebase and produce two
deliverables:

1. **Audit Report** — A structured markdown artifact covering every audit
   dimension (architecture, security, performance, code quality, DRY/duplication,
   error handling, accessibility, testing, dependency health, and more).
2. **Coding-Phase Action Prompt** — A prioritized, copy-paste-ready prompt that
   lists every finding with its exact file path, line range, severity, category,
   and a concise recommended fix so the next agent (or human) can start coding
   immediately.

---

## 2. Audit Dimensions (Checklist)

Every file batch must be evaluated against **all** of the following:

| #  | Dimension                        | What to look for                                                                                                                        |
|----|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| 1  | **Architecture & Module Design** | Circular dependencies, god modules/files, leaky abstractions, improper layering (controller → service → repo).                          |
| 2  | **Security**                     | Hardcoded secrets/keys, missing input validation, XSS vectors, SQL/NoSQL injection, insecure auth flows, CORS misconfig, unsafe `eval`. |
| 3  | **Performance**                  | N+1 queries, missing indexes, unbounded loops, memory leaks (event listeners, subscriptions), large bundle imports.                     |
| 4  | **Error Handling & Resilience**  | Swallowed errors, missing try/catch, unhandled promise rejections, no fallback UI, missing HTTP error codes.                            |
| 5  | **Code Duplication (DRY)**       | Copy-pasted logic across files/modules, duplicated utility functions, repeated API call patterns.                                       |
| 6  | **Type Safety**                  | `any` types, missing return types, untyped function parameters, inconsistent DTO usage.                                                 |
| 7  | **API Contract Consistency**     | Mismatched frontend fetch calls vs backend endpoints, inconsistent naming, missing DTOs.                                                |
| 8  | **State Management**             | Prop drilling, stale closures, missing dependency arrays in hooks, race conditions in async state.                                      |
| 9  | **Accessibility (a11y)**         | Missing ARIA labels, no keyboard navigation, insufficient color contrast, missing alt text.                                             |
| 10 | **Testing Coverage Gaps**        | Untested critical paths, missing edge-case tests, no integration tests for key flows.                                                  |
| 11 | **Dependency & Config Health**   | Outdated packages, unused dependencies, missing env validation, inconsistent config patterns.                                           |
| 12 | **CSS & Styling**                | Unused styles, inconsistent units, missing responsive breakpoints, z-index conflicts, duplicated style rules.                           |
| 13 | **Real-Time / WebSocket**        | Missing reconnection logic, no heartbeat, unclean socket teardown, missing room management.                                            |
| 14 | **DevOps & Deployment**          | Missing health checks, no graceful shutdown, hardcoded URLs, missing Docker optimizations.                                              |
| 15 | **Documentation & Readability**  | Missing JSDoc on public APIs, unclear variable names, dead code / commented-out blocks, overly complex functions.                       |

---

## 3. Orchestration Workflow

```
┌──────────────────────────────────────────────────┐
│              ORCHESTRATING AGENT                  │
│  1. Inventory all source files                   │
│  2. Split into batches of 20                     │
│  3. Dispatch Subagent-A (odd batches)            │
│     Dispatch Subagent-B (even batches)           │
│  4. Collect partial audit JSONs from both        │
│  5. Merge, deduplicate, cross-reference          │
│  6. Write final Audit Report artifact            │
│  7. Write Coding-Phase Action Prompt artifact    │
└──────────────────────────────────────────────────┘
```

### 3.1 File Inventory

1. List every source file (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`,
   `.html`, `.json` config files, `.yml`/`.yaml`, `.env.*`) excluding
   `node_modules`, `dist`, `build`, `.git`, `coverage`, and `.agents`.
2. Sort files by module/directory so related files land in the same batch.
3. Create numbered batches of **20 files** each.

### 3.2 Subagent Dispatch Rules

- **Two subagents** run in parallel, each receiving alternating batches:
  - **Subagent-A**: batches 1, 3, 5, 7, …
  - **Subagent-B**: batches 2, 4, 6, 8, …
- Each subagent must:
  1. **Read** every file in its batch using `view_file` (NEVER edit/delete).
  2. Evaluate each file against ALL 15 audit dimensions.
  3. Return structured findings in the format below.

### 3.3 Subagent Finding Format

Each subagent must return its findings as a structured list. For each finding:

```
### Finding: <short title>
- **File**: <absolute path>
- **Lines**: L<start>–L<end> (or "entire file" if systemic)
- **Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ⚪ Info
- **Category**: <one of the 15 dimensions>
- **Description**: <what is wrong and why it matters>
- **Recommendation**: <specific fix, with code pattern if helpful>
- **Cross-references**: <related files affected, if any>
```

### 3.4 Orchestrator Merge & Review

After both subagents complete:

1. **Merge** all findings into a single list.
2. **Deduplicate** — collapse identical issues across batches (e.g., the same
   duplicated utility found by both subagents).
3. **Cross-reference** — link related findings (e.g., a frontend fetch that
   hits a backend endpoint with no validation).
4. **Verify severity** — re-assess severity in the context of the full codebase.
5. **Group by dimension** for the Audit Report.
6. **Group by priority** for the Coding-Phase Action Prompt.

---

## 4. Output: Audit Report Artifact

**Filename**: `codebase_audit_report.md`

Structure:

```markdown
# 🔍 Full Codebase Audit Report
> Generated: <timestamp>
> Codebase: <project name>
> Total files audited: <N>

## Executive Summary
<high-level health score and top 5 most critical findings>

## Audit Statistics
| Severity | Count |
|----------|-------|
| 🔴 Critical | X |
| 🟠 High     | X |
| 🟡 Medium   | X |
| 🔵 Low      | X |
| ⚪ Info      | X |

## Findings by Dimension

### 1. Architecture & Module Design
<grouped findings with file links>

### 2. Security
...
(repeat for all 15 dimensions)

## Cross-Cutting Concerns
<findings that span multiple dimensions>

## Positive Observations
<things the codebase does well — always include this>
```

---

## 5. Output: Coding-Phase Action Prompt

**Filename**: `audit_action_prompt.md`

This artifact is a **ready-to-use prompt** for the next coding session. Structure:

```markdown
# 🛠️ Codebase Audit — Action Items

> This prompt was auto-generated from the Full Codebase Audit.
> Feed this to a coding agent or use it as a task list.

## How to Use
Copy this entire document into a new conversation and ask the agent to
work through the items in priority order.

---

## 🔴 Critical (Fix Immediately)

### C-1: <title>
- **Where**: `<file path>` lines L<start>–L<end>
- **What**: <description>
- **How to fix**: <step-by-step recommendation>
- **Related files**: <list>

### C-2: ...

---

## 🟠 High Priority

### H-1: ...

---

## 🟡 Medium Priority
...

## 🔵 Low Priority / Nice-to-Have
...

## ⚪ Informational / Future Consideration
...
```

---

## 6. Safety Constraints

- **NO** `write_to_file`, `replace_file_content`, `multi_replace_file_content`,
  or `run_command` with destructive operations (rm, del, git checkout, etc.)
  may be used against the audited repository.
- Subagents must only use `view_file`, `grep_search`, `list_dir`, and
  `read_url_content` (for documentation lookups).
- All output artifacts go to the **conversation artifact directory only**.

---

## 7. Quick-Start Invocation

When this skill is activated, the orchestrating agent should:

1. Read this SKILL.md
2. Inventory the codebase files
3. Split into batches of 20
4. Launch Subagent-A and Subagent-B in parallel
5. Collect results
6. Produce both artifacts

No user interaction is needed beyond activating the skill.
