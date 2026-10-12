---
name: audit-remediation-runner
description: >-
  Orchestrates the remediation of a codebase audit using two cooperative subagents
  (Worker Alpha & Worker Beta) that fix findings one by one across non-conflicting
  domains. Maintains persistent on-disk task journals and verification checkpoints
  so remediation progress is never lost across context compaction or token limits.
---

# Codebase Audit Remediation Runner — Dual-Agent Orchestration Skill

> **CARDINAL PRINCIPLE**: Remediation must be **systematic**, **verifiable**, and **token-resilient**.
> Every action item from the audit action prompt is assigned to one of two subagents,
> remediated one by one, verified against build & test gates, and permanently logged in a
> persistent task journal artifact on disk before moving to the next item.

---

## 1. Overview & Dual-Agent Architecture

When tackling large codebase audits (e.g., 20–50+ vulnerabilities, architectural bugs, and quality items),
a single context window will inevitably suffer token exhaustion or context compaction.
This skill partitions the remediation workload across two specialized subagents and enforces
an on-disk journal protocol that survives compactions seamlessly.

```
                      ┌──────────────────────────────────────────────┐
                      │             Orchestrator Agent               │
                      │  - Parses Audit Action Prompt                │
                      │  - Partitions Items into Alpha & Beta domains│
                      │  - Initializes Persistent Journals           │
                      │  - Conducts Final Quality & CI/CD Gate       │
                      └──────────────┬────────────────┬──────────────┘
                                     │                │
                    Dispatches Domain 1              Dispatches Domain 2
                                     │                │
            ┌────────────────────────▼───┐        ┌───▼────────────────────────┐
            │       Worker Alpha         │        │        Worker Beta         │
            │ Security, Guards, Routes,  │        │ Services, Data Integrity,  │
            │ Controllers, DTOs & API    │        │ Memory Cleanup, Pagination,│
            │ Clients                    │        │ Tests & CI/CD Infrastructure│
            └──────────────┬─────────────┘        └───┬────────────────────────┘
                           │                          │
                 Updates Journal per Item      Updates Journal per Item
                           │                          │
            ┌──────────────▼─────────────┐        ┌───▼────────────────────────┐
            │ scratch/audit_journal_     │        │ scratch/audit_journal_     │
            │ alpha.md                   │        │ beta.md                    │
            └────────────────────────────┘        └────────────────────────────┘
```

---

## 2. Workload Partitioning Strategy

To prevent merge conflicts and file race conditions, partition tasks by **architectural domain**:

| Subagent | Assigned Domain & Responsibilities | Typical Findings Handled |
| :--- | :--- | :--- |
| **Worker Alpha** | **Perimeter Security, Controllers & Network** | • Authentication bypasses & superadmin escalation (C-1)<br>• BOLA / IDOR route authorization (C-2, C-4)<br>• Controller Guards & Ownership checks (C-3, C-5, C-10)<br>• CORS & Webhook security headers (C-7, C-8)<br>• HTTP DTO class-validator decorators (H-5)<br>• Isolated frontend API clients & Axios interceptors (H-3) |
| **Worker Beta** | **Core Services, Infrastructure, Resilience & Tests** | • Service ownership checks & data sanitization (C-6, C-9)<br>• Environment variable integrity (C-12)<br>• Port & container configurations (H-1, H-2)<br>• WebSocket gateway auth handshakes (H-4)<br>• Memory leak / LRU TTL evictions (M-1)<br>• Silent error handling / logging (M-2)<br>• Query pagination (M-3)<br>• Automated unit & integration tests (T-1, T-2) |

---

## 3. Persistent Checkpoint & Task Journal Protocol

### Why On-Disk Task Journals are Mandatory
Context compaction summarization may compress intermediate conversation history.
By writing every step to persistent markdown files in the artifact/scratch directory:
1. Any resuming agent reads the journal to know the exact state of work within seconds.
2. Zero duplicate work occurs.
3. Every code change has an immutable verification log.

### Journal File Locations
- **Worker Alpha Journal**: `<artifactDir>/scratch/audit_journal_alpha.md`
- **Worker Beta Journal**: `<artifactDir>/scratch/audit_journal_beta.md`
- **Orchestrator Consolidated Ledger**: `<artifactDir>/audit_remediation_ledger.md`

### Task Journal Entry Template
Every subagent must write this format for each item in its journal:

```markdown
# Audit Remediation Journal — Worker Alpha

## Task Manifest
- [x] C-1: Prevent Unauthenticated Superadmin Privilege Escalation
- [x] C-2: Fix BOLA / IDOR in Private Direct Messages
- [ ] C-3: Restrict Feed Post Deletion to Post Author or Admin
- [ ] C-4: Enforce Authentication on Store Portal Routes

---

### [C-1] Prevent Unauthenticated Superadmin Privilege Escalation
- **Status**: COMPLETED
- **Timestamp**: 2026-10-12T11:20:00Z
- **Target Files**:
  - `backend/src/auth/auth.controller.ts`
  - `backend/src/auth/auth.service.ts`
- **Actions Taken**:
  - Enforced `role = 'customer'` for all public registrations.
  - Added `@Post('admin/create-staff')` guarded by `AdminAuthGuard`.
- **Verification Gate**:
  - Command: `npm test -- auth.service.spec.ts`
  - Output: PASS (2 tests passed)
- **Git Diff Summary**: Role assignment restricted, staff route added.
```

---

## 4. Subagent Execution Protocol (Item-by-Item)

For every single item on the assigned task list, the subagent **must** execute this 5-step loop:

### Step 1: Context & File Inspection
- Read the issue description from the audit action prompt.
- Inspect the current file lines using `view_file`.
- Check related models/types to avoid breaking contracts.

### Step 2: Surgical Code Edit
- Apply the fix using `replace_file_content` (or `write_to_file` if creating a new file/DTO).
- Never delete unrelated comments, helper functions, or type declarations.
- Follow existing codebase patterns and TypeScript standards.

### Step 3: Verification Gate
- Run the targeted test or build:
  ```bash
  # For backend changes:
  npm test -- <relevant-spec>
  npm run build
  
  # For frontend changes:
  npm run build
  ```
- If compilation fails or tests break, immediately fix the regression before proceeding.

### Step 4: Record in Persistent Journal
- Append the completed entry to `scratch/audit_journal_<alpha|beta>.md`.
- Mark the task checkbox as `[x] COMPLETED`.

### Step 5: Advance to Next Item
- Proceed to the next pending item on the manifest.

---

## 5. Orchestrator Workflow

### Phase A: Setup & Partitioning
1. Read the audit report and action prompt (`audit_action_prompt.md`).
2. Divide items into Domain Alpha (Perimeter/Controllers/Network) and Domain Beta (Services/Resilience/Tests).
3. Initialize the two task journals in the `scratch/` directory with full checklists.

### Phase B: Subagent Dispatch & Monitoring
1. Spawn/instruct Worker Alpha with its assigned item list and journal path.
2. Spawn/instruct Worker Beta with its assigned item list and journal path.
3. Monitor subagent outputs and track journal updates.

### Phase C: Resumption from Compaction (Recovery Protocol)
If context compaction occurs or execution is resumed:
1. **Read Journals**: Open `scratch/audit_journal_alpha.md` and `scratch/audit_journal_beta.md`.
2. **Identify In-Flight Work**: Find the first item marked `[IN_PROGRESS]` or unchecked `[ ]`.
3. **Verify Git State**: Run `git status -s` to confirm modified files.
4. **Continue Execution**: Pick up directly with the next unchecked item.

### Phase D: Final Convergence & Verification
1. Run full backend test suite:
   ```bash
   cd backend && npm test
   ```
2. Run backend production build:
   ```bash
   cd backend && npm run build
   ```
3. Run customer frontend build:
   ```bash
   cd frontend && npm run build
   ```
4. Verify revenue portals (Admin, Clinic, Store):
   ```bash
   cd Admin-Portal && npm run build
   ```
5. Consolidate journals into final artifact: `audit_remediation_ledger.md`.
6. Provide a concise summary to the user with clickable file links and test metrics.

---

## 6. Checklist & Quality Gates

Before declaring remediation complete, verify:
- [ ] Every item from the audit action prompt has `[x] COMPLETED` in its journal.
- [ ] Zero TypeScript compiler errors (`npm run build` exits with code 0).
- [ ] 100% of unit and integration test suites pass (`npm test` exits with code 0).
- [ ] No unhandled `any` types remain in newly touched DTOs or controller endpoints.
- [ ] Both subagent journals exist and are fully documented in the artifacts directory.
