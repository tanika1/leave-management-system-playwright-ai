# REQUIREMENT_TRACEABILITY_MATRIX.md

This RTM maps requirements → test design → execution outcomes → defects/risks.
It is aligned with:
- [PROJECT_DISCOVERY.md](../architecture/PROJECT_DISCOVERY.md)
- [AGENT.md](../architecture/AGENT.md)
- [MEMORY.md](../architecture/MEMORY.md)
- [RISK_MATRIX.md](../architecture/RISK_MATRIX.md)
- [TEST_STRATEGY.md](./TEST_STRATEGY.md)
- [FRAMEWORK_ARCHITECTURE.md](../architecture/FRAMEWORK_ARCHITECTURE.md)

Status markers used in this document:
- ✅ Implemented / Verified
- 🟡 Planned / Recommended / Needs targeted verification
- ⚪ Out of Scope / Not Implemented

## 1) Requirement IDs and Business Objectives
- REQ-001 — View per-type leave balance (Employee visibility)
- REQ-002 — View own leave requests (Employee visibility)
- REQ-003 — Submit leave request (Employee action)
- REQ-004 — Validate leaveType presence and recognition (Submission validation)
- REQ-005 — Validate endDate ≥ startDate (Submission validation)
- REQ-006 — Validate startDate ≥ UTC today (Submission validation)
- REQ-007 — Weekday-only day count; reject zero-weekday ranges (Submission validation)
- REQ-008 — Only Approved requests consume balance; submission not balance-gated (Business rule)
- REQ-009 — Cancel own Pending request only (Employee action + auth check)
- REQ-010 — View all leave requests (Manager visibility)
- REQ-011 — Approve Pending request only (Manager action + state machine)
- REQ-012 — Approval requires sufficient remaining balance for limited types (Business rule)
- REQ-013 — Unpaid leave unlimited and approvable without balance check (Business rule)
- REQ-014 — Reject Pending request only with non-empty reason (Manager action + validation)
- REQ-015 — Rejection reason persisted and surfaced (Data integrity/UI visibility)
- REQ-016 — Allowed transitions only: Pending→Approved/Rejected/Cancelled; terminal otherwise (State machine)
- REQ-017 — Role-aware navigation and role switcher behaviour (UI)
- REQ-018 — Employees list is available and fixed (Seed data)
- REQ-019 — Error/status semantics: 400/403/404/409 as implemented (API contract)
- REQ-020 — Health and Shell endpoints respond per contract (API contract)

## 2) Requirement Traceability Matrix

Fields: Requirement ID | Risk Level | Priority | Automation Priority | Recommended Test Level | Associated APIs | Associated UI Components | Expected Behaviour | Negative Scenarios | Edge Cases

- REQ-001 | P1 | High | High | API, UI | GET /api/employee/balance | BalanceCardComponent | Returns per-type balances; Unpaid has null remainingDays | Unknown employee → 404 | Large usedDays; mix of types
- REQ-002 | P2 | High | High | API, UI | GET /api/employee/leave-requests | LeaveRequestTableComponent | Returns only employee’s requests | Unknown employee → 404 | Many rows; sorting absence
- REQ-003 | P1 | High | High | API, UI, E2E | POST /api/employee/leave-requests | LeaveRequestFormComponent | Creates Pending request; returns request+breakdown | Missing/invalid leaveType → 400 | Long ranges; single weekday
- REQ-004 | P1 | High | High | API, UI | POST /api/employee/leave-requests | LeaveRequestFormComponent | leaveType required and enum-valid | leaveType null/invalid → 400 | Casing issues
- REQ-005 | P1 | High | High | API | POST /api/employee/leave-requests | LeaveRequestFormComponent | endDate ≥ startDate | endDate < startDate → 400 | Start=end boundary
- REQ-006 | P2 | Med | Med | API | POST /api/employee/leave-requests | LeaveRequestFormComponent | startDate not in past (UTC) | past start → 400 | UTC boundary near midnight
- REQ-007 | P1 | High | High | API | POST /api/employee/leave-requests | LeaveRequestFormComponent | weekdays only; 0 weekday → 400 | Sat–Sun range | Fri–Mon span counting
- REQ-008 | P1 | High | High | API, E2E | ALL | BalanceCardComponent | Only Approved consume balance; submission not blocked | N/A | Interleaved sequences
- REQ-009 | P1 | High | High | API, UI, E2E | POST /api/employee/leave-requests/{id}/cancel | LeaveRequestTableComponent | Owner can cancel Pending → Cancelled | Not owner → 403; NotPending → 409 | Multi-cancel attempts
- REQ-010 | P2 | High | Med | API, UI | GET /api/manager/leave-requests | LeaveRequestTableComponent | Returns all requests | N/A | Many rows
- REQ-011 | P1 | High | High | API, UI, E2E | POST /api/manager/leave-requests/{id}/approve | LeaveRequestTableComponent | Pending→Approved only | NotFound/AlreadyApproved/NotPending/InsufficientBalance → conflict codes | Near-zero remainingDays
- REQ-012 | P1 | High | High | API, E2E | POST /api/manager/leave-requests/{id}/approve | BalanceCardComponent | Requires sufficient remainingDays for limited types | InsufficientBalance → 409 | RemainingDays=0 boundary
- REQ-013 | P1 | High | Med | API | POST /api/manager/leave-requests/{id}/approve | BalanceCardComponent | Unpaid always approvable | N/A | Long unpaid durations
- REQ-014 | P1 | High | High | API, UI, E2E | POST /api/manager/leave-requests/{id}/reject | RejectionDialogComponent | Pending→Rejected with non-empty reason | Missing/whitespace reason → 400 | Long text reasons
- REQ-015 | P2 | Med | Med | API, UI | GET lists after rejection | LeaveRequestTableComponent | reason field visible on Rejected | N/A | Encoding/special chars
- REQ-016 | P1 | High | High | API, E2E | POST approve/reject/cancel | LeaveRequestTableComponent | State-machine enforced | Any non-Pending transition → 409 | Duplicates
- REQ-017 | P2 | Med | Med | UI | N/A | Sidebar/Navigation | Role switch changes nav and resets active section | N/A | Rapid toggles
- REQ-018 | P3 | Low | Low | API, UI | GET /api/employees | EmployeeSelectorComponent | Returns seeded list; populates selector | N/A | Display only
- REQ-019 | P2 | Med | High | API | All negative paths | N/A | Status codes and messages consistent with implementation | 403 without body handled | N/A
- REQ-020 | P3 | Low | Low | API, UI | GET /api/health, /api/shell | N/A | Health ok; Shell returns contract | N/A | N/A

## 3) Test Ownership & Traceability
- Ownership tags: `[api]`, `[ui]`, `[e2e]`, `[exploratory]`
- Every test should include REQ-ID(s), FEAT tag(s), and layer label for traceability.

## 4) Negative Scenarios (Cross-Requirement)
- Invalid enum values, empty/whitespace rejection reason, past-date UTC, endDate<startDate, non-owner cancel, non-pending transitions, unknown employeeId, 403 without message body, 404 not found.

## 5) Edge Case Catalog (Cross-Requirement)
- Single weekday ranges, weekend-only ranges, boundary remainingDays=0, UTC midnight edge, rapid role/employee toggling.

## 6) Mapping to Features
- FEAT-LEAVE-SUBMIT ↔ REQ-003..007
- FEAT-LEAVE-APPROVE ↔ REQ-011..013,016
- FEAT-LEAVE-REJECT ↔ REQ-014..016
- FEAT-LEAVE-CANCEL ↔ REQ-009,016
- FEAT-BALANCE ↔ REQ-001,008,012,013
- FEAT-ROLE-NAV ↔ REQ-017
- FEAT-REQUESTS-LIST ↔ REQ-002,010,015
- FEAT-VALIDATION ↔ REQ-004..007,014,019
- FEAT-STATUS-SEMAN ↔ REQ-019
- FEAT-HEALTH-SHELL ↔ REQ-020

## 7) Coverage Tags & Priorities
- Risk Level: P1, P2, P3
- Priority: High/Med/Low
- Automation Priority: High for P1 APIs + critical E2E; Medium for UI essentials; Low for minor endpoints.

## 8) Usage Guidance
- API/UI automation generation must reference REQ-IDs and FEAT tags.
- Defects must link REQ-IDs and coverage IDs from [COVERAGE_MATRIX.md](./COVERAGE_MATRIX.md).

---

## Execution Status (Manual Sync)

Execution source: **manually executed by user**.

### Layer-level execution summary
- API: 27 executed, 24 passed, 3 failed (88.9%)
- UI: 7 executed, 7 passed, 0 failed (100%)
- E2E: 3 executed, 3 passed, 0 failed (100%)
- Overall: 37 executed, 34 passed, 3 failed (91.9%)

### Requirement status highlights
- ✅ Most mapped requirements are implemented and exercised through API/UI/E2E automation.
- ❌ REQ-009 — **Failed** due to app defect [BUG-001](../reports/BUGS.md#bug-001--unauthorized-cancellation-returns-500-instead-of-403).
- ❌ REQ-019 — **Failed (partial)** on cancellation semantics due to [BUG-001](../reports/BUGS.md#bug-001--unauthorized-cancellation-returns-500-instead-of-403).
- 🟡 REQ-001 / REQ-008 / REQ-012 — balance-related determinism remains sensitive in shared-state parallel scenarios; targeted isolated re-run remains recommended.

### Verification status
- ✅ Implemented: API, UI, E2E layers and traceability structure.
- 🟡 Planned/Recommended: targeted isolated re-run for balance determinism evidence.
- ⚪ Out of scope: auth model validation beyond current application design.
