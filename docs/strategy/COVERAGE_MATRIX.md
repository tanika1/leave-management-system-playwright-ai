# COVERAGE_MATRIX.md

This matrix maps requirement coverage across API/UI/E2E and records synchronized execution outcomes.
Authoritative references:
- [PROJECT_DISCOVERY.md](../architecture/PROJECT_DISCOVERY.md)
- [AGENT.md](../architecture/AGENT.md)
- [MEMORY.md](../architecture/MEMORY.md)
- [RISK_MATRIX.md](../architecture/RISK_MATRIX.md)
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)
- [FRAMEWORK_ARCHITECTURE.md](../architecture/FRAMEWORK_ARCHITECTURE.md)

Status markers:
- ✅ Implemented
- 🟡 Planned / Recommended
- ⚪ Out of Scope / Not Implemented

## 1) Business Requirement Inventory (IDs)
- REQ-001 — Employee can view per-type leave balance
- REQ-002 — Employee can view own leave requests
- REQ-003 — Employee can submit a leave request
- REQ-004 — Submission requires leaveType to be present and recognized
- REQ-005 — Submission requires endDate ≥ startDate
- REQ-006 — Submission requires startDate ≥ UTC today (past dates invalid)
- REQ-007 — Submission counts weekdays only; zero-weekday ranges are rejected
- REQ-008 — Only Approved requests consume balance; submission not blocked by balance
- REQ-009 — Employee can cancel own Pending request only
- REQ-010 — Manager can view all leave requests
- REQ-011 — Manager can approve a Pending request only
- REQ-012 — Approving limited leave types requires sufficient remaining balance
- REQ-013 — Unpaid leave is unlimited and always approvable
- REQ-014 — Manager can reject a Pending request only, with non-empty reason
- REQ-015 — Rejection reason is persisted and returned in records
- REQ-016 — Valid status transitions: Pending→Approved/Rejected/Cancelled only; terminal otherwise
- REQ-017 — Employee and Manager navigation/role filtering behaves as defined
- REQ-018 — Employees list is available and fixed
- REQ-019 — API error semantics use 400/403/404/409 as implemented
- REQ-020 — Health and Shell endpoints respond per contract

## 2) Feature Inventory
- FEAT-EMP-SELECT — Employee selection (UI)
- FEAT-LEAVE-SUBMIT — Leave submission (API/UI)
- FEAT-LEAVE-APPROVE — Manager approval (API/UI)
- FEAT-LEAVE-REJECT — Manager rejection (API/UI)
- FEAT-LEAVE-CANCEL — Employee cancellation (API/UI)
- FEAT-BALANCE — Balance computation and display (API/UI)
- FEAT-ROLE-NAV — Role-aware navigation and role switcher (UI)
- FEAT-REQUESTS-LIST — Employee and manager request lists (API/UI)
- FEAT-VALIDATION — Input/date/type validations (API/UI messaging)
- FEAT-STATUS-SEMAN — HTTP status semantics (API)
- FEAT-HEALTH-SHELL — Health and shell metadata (API/UI)

## 3) Coverage Matrix (per REQ; layer coverage and status)
Legend: C=Covered, S=Smoke, R=Regression, E=Exploratory

| REQ | Risk | API | UI | E2E | Explor. | Regression | Smoke | Risk Coverage | Business Coverage | Automation Status |
|-----|------|-----|----|-----|---------|------------|-------|---------------|------------------|------------------|
| 001 | P1 | C | C |  | E | C | S | High | High | ✅ Implemented (🟡 parallel-sensitive) |
| 002 | P2 | C | C |  | E | C |  | Med | High | ✅ Implemented |
| 003 | P1 | C | C | C | E | C | S | High | High | ✅ Implemented |
| 004 | P1 | C | C |  | E | C |  | High | High | ✅ Implemented |
| 005 | P1 | C |  |  | E | C |  | High | High | ✅ Implemented |
| 006 | P2 | C |  |  | E | C |  | Med | High | ✅ Implemented |
| 007 | P1 | C |  |  | E | C |  | High | High | ✅ Implemented |
| 008 | P1 | C |  | C | E | C | S | High | High | ✅ Implemented (🟡 parallel-sensitive) |
| 009 | P1 | C | C | C | E | C | S | High | High | ✅ Implemented (❌ blocked by BUG-001) |
| 010 | P2 | C | C |  | E | C |  | Med | High | ✅ Implemented |
| 011 | P1 | C | C | C | E | C | S | High | High | ✅ Implemented |
| 012 | P1 | C |  | C | E | C | S | High | High | ✅ Implemented (🟡 parallel-sensitive) |
| 013 | P1 | C |  |  | E | C |  | High | High | ✅ Implemented |
| 014 | P1 | C | C | C | E | C | S | High | High | ✅ Implemented |
| 015 | P2 | C | C |  | E | C |  | Med | High | ✅ Implemented |
| 016 | P1 | C |  | C | E | C | S | High | High | ✅ Implemented |
| 017 | P2 |  | C |  | E | C |  | Med | Med | ✅ Implemented |
| 018 | P3 | C | C |  |  | C |  | Low | Med | ✅ Implemented |
| 019 | P2 | C |  |  | E | C |  | Med | Med | ✅ Implemented (❌ partial contract failure via BUG-001) |
| 020 | P3 | C | C |  |  | C |  | Low | Low | ✅ Implemented |

Notes:
- E2E remains focused on the highest business-value journeys per [TEST_STRATEGY.md](./TEST_STRATEGY.md).
- UI coverage focuses on role switching, state sync, navigation, and error behavior.

## 4) API Coverage Plan (IDs)
- API-001 — Health
- API-002 — Shell
- API-003 — Employees
- API-004 — Employee Balance
- API-005 — Employee Requests
- API-006 — Submit Leave
- API-007 — Cancel Leave
- API-008 — Manager Requests
- API-009 — Approve Leave
- API-010 — Reject Leave

## 5) UI Coverage Plan (IDs)
- UI-001 — Navigation and role switcher
- UI-002 — Employee selector behavior
- UI-003 — Leave form behavior
- UI-004 — Employee requests grid
- UI-005 — Manager requests grid and actions
- UI-006 — Error/feedback handling
- UI-007 — Accessibility heuristics

## 6) End-to-End Coverage Plan (IDs)
- E2E-001 — Submit → Approve → Balance effect
- E2E-002 — Submit → Reject with reason
- E2E-003 — Submit → Cancel (owner + pending)

## 7) Exploratory Coverage Plan (Charters)
- EXP-UTC
- EXP-WEEKEND
- EXP-TOGGLE
- EXP-CONFLICT
- EXP-ERRORS

## 8) Coverage Gaps
- ⚪ Full WCAG compliance audit
- ⚪ High-volume performance/load validation
- ⚪ Deep concurrency stress beyond targeted checks
- ⚪ Authentication/authorization validation model

## 9) Automation Roadmap (Remaining)
1. 🟡 Strengthen balance determinism evidence under parallel pressure
2. 🟡 Expand non-functional validation (a11y depth, perf signals)
3. ⚪ Security and persistence scenarios once product scope supports them

---

## Execution Results (Manual Sync)

Execution source: **manually executed by user**.

### Layer-level results
- API: 27 executed, 24 passed, 3 failed (88.9%)
- UI: 7 executed, 7 passed, 0 failed (100%)
- E2E: 3 executed, 3 passed, 0 failed (100%)
- Overall: 37 executed, 34 passed, 3 failed (91.9%)

### Failure mapping
- REQ-009 / API-007 — Failed due to [BUG-001](../reports/BUGS.md#bug-001--unauthorized-cancellation-returns-500-instead-of-403): non-owner cancel returns 500 instead of expected 403.
- REQ-019 / API-007 — Failed (partial) due to [BUG-001](../reports/BUGS.md#bug-001--unauthorized-cancellation-returns-500-instead-of-403).
- REQ-001/REQ-008/REQ-012 / API-004 — Parallel sensitivity remains a residual risk for deterministic balance delta verification.

### Residual risk
- Unauthorized cancellation semantics remain non-compliant until BUG-001 is fixed.
- Shared in-memory state under parallel execution can still affect balance-sensitive checks without strict isolation controls.
