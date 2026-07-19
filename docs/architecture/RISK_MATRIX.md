# RISK_MATRIX.md

Updated, implementation-driven risk assessment based on: backend/Program.cs, backend/LMS.csproj, frontend/src/App.jsx, frontend/src/main.jsx, frontend/vite.config.js, README.md, MEMORY.md, PROJECT_DISCOVERY.md.

## Scoring Model
- Business Impact (BI): 1–5
- Likelihood of Failure (LF): 1–5
- Priority (P): P1 critical, P2 medium-high, P3 moderate, P4 low
- Automation Priority (AP): High / Medium / Low (return on effort in hackathon)
- Testing Layer: UI, API, E2E, Exploratory (primary first)

---

## Feature Risk Matrix (with rationale)

| # | Feature | BI | LF | P | AP | Testing Layer | Recommended Technique | Why this ranking |
|---|---|---:|---:|:--:|:--:|---------------|-----------------------|------------------|
| 1 | Submit leave request (POST /api/employee/leave-requests) | 5 | 4 | P1 | High | API, E2E, UI | Decision tables, boundary-value, negative contracts | Core entry to workflow; multiple validations (type/date/weekday). Implemented checks in TrySubmitLeaveRequest; high surface for input errors. |
| 2 | Approve request (POST /api/manager/leave-requests/{id}/approve) | 5 | 4 | P1 | High | API, E2E, UI | State-transition tests, equivalence partitioning | Determines balance consumption; multiple conflict branches (NotFound, AlreadyApproved, NotPending, InsufficientBalance). Highest business impact. |
| 3 | Balance computation (GetBalance, GetBalanceBreakdown) | 5 | 3 | P1 | High | API, Exploratory | Property-based + scenario matrices | Directly affects entitlements; relies on correct aggregation of Approved requests by type; easy to regress with new states. |
| 4 | Cancel own pending request (POST /api/employee/leave-requests/{id}/cancel?employeeId=) | 4 | 4 | P1 | High | API, E2E, UI | Authorization matrix, state-guard tests | Must enforce ownership + pending-only. Code has 403 Forbid without JSON body and 409 for NotPending; easy to mishandle in UI. |
| 5 | Reject with reason (POST /api/manager/leave-requests/{id}/reject) | 4 | 4 | P1 | High | API, E2E, UI | Negative tests, input sanitization, state-transition | Mandatory non-whitespace reason; persistence to record; multiple failure modes. |
| 6 | Weekday-only day counting (LeavePolicy.CountWeekdays) | 5 | 3 | P1 | Medium | API | Boundary tests (single-day, weekend-only, cross-week) | Off-by-one and weekend handling are classic pitfalls; affects days and balance. Medium AP since API-only but essential. |
| 7 | Past-date validation (UTC-based) | 4 | 4 | P2 | Medium | API, UI, Exploratory | Time-travel/date injection, boundary at UTC rollover | Backend uses UTC date; user-local mismatch likely; intermittent edge around day boundaries. |
| 8 | Employee-scoped retrieval (GET /api/employee/balance, leave-requests) | 4 | 3 | P2 | High | API, UI | Parameterized tests, identity-context switching | Default employeeId=1 fallback and 404 path; filtering correctness is critical to user trust; high AP via API. |
| 9 | Manager list (GET /api/manager/leave-requests) | 4 | 3 | P2 | Medium | API, UI | Data-driven assertions, UI/API parity | Must reflect all requests; no pagination; stale data risks in UI reload patterns. |
| 10 | Role switcher behavior (Employee↔Manager) | 4 | 3 | P2 | Medium | UI, E2E, Exploratory | Model-based UI state tests, rapid toggle tours | View filtering and activeNav resets implemented in App.jsx; risk of stale state carryover. |
| 11 | Employee selector switching + data reload | 4 | 4 | P2 | Medium | UI, E2E, Exploratory | Async race tests, deterministic wait strategy | Parallel fetches for balance/requests; risk of showing mismatched data when switching quickly. |
| 12 | HTTP status semantics (400/403/404/409 consistency) | 4 | 3 | P2 | High | API | Matrix of negative-path assertions | Mixed returns in code (Forbid without JSON; Conflicts for non-pending). High AP to stabilize client handling and docs. |
| 13 | Error feedback rendering (feedback/feedbackType) | 3 | 3 | P3 | Medium | UI, E2E | Error injection, message mapping checks | UI surfaces backend messages; varied shapes; ensure clear, resettable feedback states. |
| 14 | Shell metadata + nav filtering (GET /api/shell vs frontend constants) | 3 | 2 | P3 | Low | API, UI | Contract snapshot tests | Low change surface; potential drift vs frontend constants. |
| 15 | In-memory lifecycle across runtime (restart behavior) | 5 | 3 | P2 | Medium | E2E, API, Exploratory | Session/restart scenarios | Data loss on restart is by design; verify user-visible implications and messaging. |
| 16 | JSON enum (string) serialization | 3 | 2 | P3 | Medium | API | Fuzz enum casing/invalid values | Low likelihood but important to avoid silent failures; serializer configured for strings. |
| 17 | Dev proxy/API base resolution (VITE_PROXY_TARGET, VITE_API_BASE_URL) | 3 | 3 | P3 | Medium | UI, Exploratory | Config matrix | Misroutes cause silent failures; medium AP for environment sanity checks. |
| 18 | UI accessibility basics (focus-visible, color usage) | 3 | 3 | P3 | Low | UI, Exploratory | A11y heuristics, keyboard nav checks | Styles lack explicit focus outlines; status colors carry meaning; moderate user impact in demos. |

---

## Category Views (cross-cutting)

- Business Risks: Incorrect approvals affecting balances; inability to cancel pending requests; miscounted days causing overuse; loss of records on restart.
- Technical Risks: Single-file backend coupling; shared mutable list without synchronization; repeated scans for balance; frontend concentrated in App.jsx.
- API Risks: Mixed failure semantics (400/403/404/409); employeeId default to 1; no auth/role enforcement; enum handling.
- UI Risks: Role/employee switching races; error message inconsistency; dense tables without pagination.
- State Transition Risks: Approve/reject/cancel only allowed from Pending; duplicate approvals; conflicts handled via 409.
- Validation Risks: Date ordering, past-date (UTC), weekday-only zero-day ranges, non-whitespace rejection reason, valid leaveType.
- Concurrency Risks: Simultaneous manager actions on same request; rapid context switches in UI.
- Data Integrity Risks: Volatile in-memory state; balance correctness under varying operation order; unlimited leave handling.
- Accessibility Risks: Focus visibility; reliance on color; large tables on small viewports.
- Performance Risks: O(n) scans for balance per type; full list reloads; no pagination.
- Security Observations: No authentication; manager endpoints callable by any client; employeeId spoofable in client.
- Automation ROI: Highest at API layer for submission/approval/cancellation/validation matrices and balance properties; E2E for critical paths; UI for races and error feedback; a11y/perf are lighter-touch in hackathon.

---

## Top 20% most defect-prone (critical)
1) Approve request — complex state guards + balance check; highest business impact.
2) Submit request — multiple validations feeding downstream states.
3) Balance computation — correctness ties to entitlements and approvals.
4) Cancel own pending request — ownership + state constraints + mixed HTTP responses.

---

## Notes on Automation Priority
- High AP: API-centric features with deterministic assertions and high coverage value (1,2,3,4,8,12).
- Medium AP: UI behavior with async/race conditions and environment config (7,9,10,11,15,16,17,18,6).
- Low AP: Stable contracts with lower change frequency (14, some UI a11y polish in hackathon timeframe).

---

## Assumptions
- Risk weighting targets hackathon evaluation (defect probability × business impact × demo criticality).
- Concurrency risks inferred from shared in-memory list without locks; real races depend on invocation timing.
