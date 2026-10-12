---
name: full-codebase-audit
description: >-
  Performs an enterprise-grade, comprehensive, read-only codebase audit using two
  parallel subagents that inspect cohesive domain batches of 20 files with persistent
  on-disk checkpoint journaling. Generates an OWASP/CVSS-aligned audit report, health
  scorecard, and an actionable remediation prompt ready for audit-remediation-runner.
  This skill NEVER edits or deletes any repository file.
---

# Full Codebase Audit — Enterprise Orchestration Skill

> **CARDINAL RULE**: This skill is **STRICTLY READ-ONLY**. No file inside the audited repository
> may be modified, created, or deleted. All intermediate findings and output artifacts are
> written exclusively to the conversation's persistent artifact and scratch directory.

---

## 1. Purpose & Deliverables

Run a thorough, multi-dimensional audit of an entire codebase and produce two gold-standard deliverables:

1. **Audit Report (`codebase_audit_report.md`)**:
   - High-level Health Score (0–100) and executive summary.
   - Severity breakdown (Critical, High, Medium, Low, Informational).
   - Findings categorized across 15 architectural and engineering dimensions with OWASP/CWE mappings.
   - Positive architectural observations and existing strengths.
2. **Actionable Remediation Prompt (`audit_action_prompt.md`)**:
   - Prioritized, copy-paste-ready implementation specification.
   - Formatted for immediate execution by the `audit-remediation-runner` skill.
   - Exact file locations, line ranges, root causes, and drop-in code fix recommendations.

---

## 2. Audit Dimensions (15-Point Matrix)

Every file batch must be systematically evaluated against all 15 dimensions:

| # | Dimension | What to Look For |
|:--|:---|:---|
| 1 | **Architecture & Module Boundaries** | Leaky abstractions, circular dependencies, god files (>500 LOC), improper layering (`controller -> service -> repo`). |
| 2 | **Security & OWASP Top 10** | Injection (SQL/NoSQL/Command), BOLA/IDOR, broken authentication, hardcoded secrets, CSRF, insecure CORS, sensitive data exposure. |
| 3 | **Input Validation & Sanitization** | Missing DTOs, unvalidated `@Body() any`, missing `class-validator` decorators, regex injection, unescaped regex. |
| 4 | **Authorization & RBAC** | Missing guards on sensitive endpoints, client-side role reliance, broken ownership checks on mutating endpoints. |
| 5 | **Performance & Memory Leaks** | Unbounded loops, missing DB indexes, unbounded in-memory maps/caches without TTL, event listener leaks, N+1 queries. |
| 6 | **Error Handling & Resilience** | Swallowed errors, silent `catch {}` blocks, unhandled promise rejections, missing HTTP error status codes, lack of graceful degradation. |
| 7 | **Code Duplication & DRY** | Copy-pasted business logic, duplicated utilities, repeated API call patterns across portals. |
| 8 | **Type Safety & TypeScript Health** | Excessive `any` types, missing return types, untyped function arguments, unsafe type assertions (`as any`). |
| 9 | **API Contract & Integration Consistency** | Mismatched frontend Axios/fetch endpoints vs NestJS routes, out-of-sync parameters, inconsistent JSON schemas. |
| 10 | **State Management & UI Lifecycles** | Stale closures, missing dependency arrays in React hooks, memory leaks on unmount, race conditions in async effects. |
| 11 | **Accessibility (a11y) & UX** | Missing ARIA labels, unhandled keyboard navigation, missing alt tags, poor contrast, lack of loading/error states. |
| 12 | **Testing & CI/CD Coverage** | Missing unit/integration tests for critical business paths, untested edge cases, missing test mocks, broken CI workflows. |
| 13 | **Real-Time / WebSocket Security** | Unauthenticated WebSocket handshakes, open CORS on socket servers, unhandled disconnects, unbounded room subscriptions. |
| 14 | **Configuration & Environment Integrity** | Hardcoded dev secrets in production, missing environment validation on startup, mismatched ports, insecure defaults. |
| 15 | **Documentation & Maintainability** | Dead code, commented-out blocks, missing public API docs, misleading variable names, unnecessary complexity. |

---

## 3. Orchestration Workflow & Smart Batching

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATING AGENT                            │
│  1. Source Inventory: Collect all source files excluding build/modules │
│  2. Smart Cohesion Batching: Group files by feature/domain (20/batch)  │
│  3. Checkpoint Setup: Initialize scratch/audit_journal_subagent_[a|b]  │
│  4. Parallel Dispatch: Subagent Alpha (Odd) & Subagent Beta (Even)     │
│  5. Incremental Journaling: Subagents flush findings after each batch  │
│  6. Merge, Cross-Reference & Deduplicate findings                      │
│  7. Generate Audit Report & Action Prompt Artifacts                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Smart Cohesive Batching Strategy
Instead of purely alphabetical sorting, order files by **architectural domain**:
- Keep `*.controller.ts`, `*.service.ts`, `*.schema.ts`, and `*.dto.ts` for the same module in the **same batch**.
- Keep frontend views, components, and contexts for the same feature in the **same batch**.
- Limit each batch to **maximum 20 files** to fit comfortably within the subagent context window.

### 3.2 Persistent On-Disk Subagent Journaling
To prevent losing audit progress if a context window compacts or token limits are hit:
- **Subagent Alpha** writes incrementally to: `<artifactDir>/scratch/audit_subagent_a.md`
- **Subagent Beta** writes incrementally to: `<artifactDir>/scratch/audit_subagent_b.md`
- After each batch of 20 files is inspected, the subagent appends its findings to its journal immediately before picking up the next batch.

### 3.3 Structured Finding Format
Subagents must record every issue with full fidelity:

```markdown
### Finding: [ID] <Short Title>
- **File**: <exact path>
- **Lines**: L<start>–L<end>
- **Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ⚪ Info
- **Category**: <One of the 15 dimensions>
- **OWASP/CWE**: <e.g., OWASP A01:2021 Broken Access Control / CWE-639>
- **Description**: <What is wrong, why it occurs, and potential impact/exploit vector>
- **Recommended Fix**: <Specific, actionable fix with sample code snippet>
- **Cross-References**: <Related files affected>
```

---

## 4. Orchestrator Convergence & Synthesis

1. **Read & Aggregate**: Read both on-disk journals (`audit_subagent_a.md` and `audit_subagent_b.md`).
2. **Deduplicate**: Merge findings that reference the same underlying root cause.
3. **Cross-Reference**: Connect frontend findings to backend findings (e.g. frontend sending unvalidated field to an open endpoint).
4. **Health Score Calculation**:
   - Start with baseline score of 100.
   - Deduct:
     - 🔴 Critical: -10 points each
     - 🟠 High: -5 points each
     - 🟡 Medium: -2 points each
     - 🔵 Low: -0.5 points each
   - Health Score = `Math.max(0, 100 - totalDeductions)`.
5. **Produce Final Deliverables**:
   - Write `codebase_audit_report.md` to artifact directory.
   - Write `audit_action_prompt.md` formatted for `audit-remediation-runner`.

---

## 5. Safety & Quality Constraints

- **STRICTLY READ-ONLY**: Never call file modification tools on repository code during audit.
- **NO HALLUCINATIONS**: Every file link must point to a real file path and line range.
- **POSITIVE RECOGNITION**: Always document strengths, well-designed patterns, and robust defenses already present.
- **SEAMLESS COMPATIBILITY**: Ensure `audit_action_prompt.md` is immediately executable by `audit-remediation-runner`.
