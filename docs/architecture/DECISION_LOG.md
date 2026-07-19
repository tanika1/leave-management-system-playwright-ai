# DECISION_LOG.md

This log records decisions made during API triage to preserve defects, improve reliability, and maintain traceability.

## DEC-001 — Preserve 403 Expectation for Non-owner Cancellation
- Issue: Non-owner cancel returned 500; README requires 403.
- Evidence: Test logs show 500 responses for non-owner cancel in two tests.
- Decision: Do not modify tests; log as application defect BUG-001; update RTM and Coverage Matrix.
- Reason: README and code-level business rules define 403; current implementation via Results.Forbid() without auth causes 500.
- Outcome: BUG-001 created; RTM and Coverage Matrix appendices updated.

## DEC-002 — Treat Balance Mid-snapshot Drift as Parallel Execution Issue
- Issue: Balance usedDays changed before approval in balance.spec.ts.
- Evidence: Shared in-memory LeaveState and common employeeId=1 across parallel workers likely caused another test’s approval to mutate state.
- Decision: Do not modify assertions; plan isolation (distinct employee IDs or single-worker/serialized scope for balance tests) if re-run required.
- Reason: Business rule is correct (only Approved consume balance); observed drift is due to shared state under parallel execution.
- Outcome: RTM and Coverage Matrix appendices note “Inconclusive due to parallel execution”; mitigation captured in TEST_ANALYSIS_REPORT.md and KNOWN_LIMITATIONS.md.

## DEC-003 — Minimal Documentation Updates Only
- Issue: Ensure docs reflect actual triage without redundancy.
- Decision: Append execution status updates to RTM and Coverage Matrix; create BUGS.md, TEST_ANALYSIS_REPORT.md, KNOWN_LIMITATIONS.md, DECISION_LOG.md.
- Reason: Token efficiency and traceability; avoid regenerating large documents.
- Outcome: All updates completed with targeted sections only.

## DEC-005 — Worker-aware Employee Isolation (Parallel-safe)
- Issue: Shared in-memory state caused nondeterministic balance mid-snapshots under parallel execution.
- Evidence: Balance usedDays changed before approval; consistent with concurrent approvals for the same employeeId.
- Decision: Implement worker-aware employee remapping in fixtures. employeeId=1 is mapped to a per-worker employeeId: (workerIndex % 5) + 1. Other IDs are unchanged to preserve test intent (e.g., employeeId=2 for unauthorized cancellation).
- Files Modified: fixtures/fixtures.ts (ApiFacade wrapper for isolation)
- Reason: Maximize parallel execution, eliminate shared test data collisions, avoid serializing suites, keep assertions intact.
- Outcome: Deterministic execution expected for balance tests under parallel runs in the default 'api' project. Verification: npx playwright test tests/api/balance.spec.ts --project=api

## DEC-006 — Playwright Project Scoping (UI vs API)
- Issue: Running `npx playwright test --project=ui` executed API specs from tests/api, causing non-UI failures to appear in the UI run.
- Evidence: Manual execution log shows API spec paths (tests\\api\\...) failing during a UI project run.
- Decision: Scope projects to dedicated test directories.
  - api: testDir = 'tests/api'
  - ui:  testDir = 'tests/ui'
  - e2e: testDir = 'tests/e2e' (reserved)
- Files Modified: playwright.config.ts
- Reason: Ensure the UI project executes only UI specs and the API project executes only API specs; prevent cross-project leakage and misleading failures.

## DEC-007 — Exploratory findings classification and documentation scope
- Issue: Senior exploratory pass surfaced session/navigation UX gaps after automation completion.
- Evidence: Live exploratory checks showed role/employee context resets on refresh and browser-history interruption behavior requiring explicit routing/session persistence.
- Decision: Classify these as enhancements (not defects), create ENHANCEMENTS.md, and avoid creating new automation for exploratory-only findings.
- Files Modified: ENHANCEMENTS.md
- Reason: Behavior is currently functional and within documented constraints; improvements are product-quality enhancements rather than requirement breaches.
- Outcome: Added ENH-001 (refresh context persistence) and ENH-002 (route-backed navigation/back-forward coherence) with requirement/risk/coverage traceability.
