---
name: code-and-test
description: >-
  Systematic workflow for writing robust code and verifying it through automated testing,
  following Test-Driven Development (TDD) principles (Red-Green-Refactor) and regression verification.
---

# Code and Test Workflow (TDD & Quality Assurance)

Use this skill whenever writing new features, fixing bugs, or refactoring existing modules to ensure all code is covered by tests and verified before finalizing.

---

## 1. Core Principles

1. **Test First or Test Alongside**: Never write untested business logic or core algorithms.
2. **Red-Green-Refactor Cycle**:
   - **Red**: Write a failing test that specifies the expected behavior.
   - **Green**: Write the minimal code needed to pass the test.
   - **Refactor**: Clean up and optimize the implementation while keeping all tests green.
3. **Verify Locally**: Always run test suites and check status outputs using terminal tools.

---

## 2. Step-by-Step Execution Workflow

### Step 1: Understand the Requirements & Existing Test Harness
- Identify the project tech stack and test framework:
  - **Node / TypeScript**: `npm test`, `npm run test:watch`, `jest`, `vitest`, `mocha`
  - **Python**: `pytest`, `python -m unittest`
  - **Go**: `go test ./...`
- Inspect existing test directories (e.g. `__tests__/`, `*.spec.ts`, `*.test.ts`, `tests/`) to follow existing conventions, mock patterns, and fixtures.

### Step 2: Write the Test Cases (Red Phase)
- Create or update the relevant test file.
- Cover:
  - **Happy paths**: Standard valid inputs and expected outcomes.
  - **Edge cases**: Null/undefined inputs, empty collections, boundary values, timeout scenarios.
  - **Error handling**: Expected errors, exceptions, and status codes.
- Run the test runner to confirm the test fails as expected for the right reason.

### Step 3: Implement Minimal Production Code (Green Phase)
- Write the function, class, or endpoint logic.
- Keep the implementation clean and focused on satisfying the test requirements.
- Run the test suite:
  ```bash
  # Example command for Node/TypeScript projects
  npm test -- <path_to_test_file>
  ```
- Confirm all new tests pass.

### Step 4: Refactor & Code Polish (Refactor Phase)
- Remove duplication, enhance readability, and add clear type definitions.
- Ensure all comments and documentation reflect the updated behavior.
- Re-run all relevant unit/integration tests to ensure no regressions were introduced.

### Step 5: Full Suite Verification
- Run the full test suite or relevant project sub-module tests before considering the task complete:
  ```bash
  npm test
  ```
- Fix any broken dependencies, types, or tests.

---

## 3. Best Practices & Checklist

- [ ] **Isolated Tests**: Mock external networks, databases, or 3rd party APIs where appropriate.
- [ ] **Descriptive Test Names**: Use clear descriptions (e.g. `it('should return 400 when email is invalid', ...)`).
- [ ] **Deterministic Results**: Ensure tests do not rely on random state or timing conditions.
- [ ] **No Dead Code**: Verify clean imports and remove console logs used for debugging.
