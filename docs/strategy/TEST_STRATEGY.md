# TEST_STRATEGY.md

This strategy is implementation-aware and optimized for a 5-hour AI Testing Hackathon. It builds on the canonical docs in this repo: PROJECT_DISCOVERY.md, AGENT.md, MEMORY.md, and RISK_MATRIX.md. Those documents are the single source of truth for architecture, rules, and risks; this strategy references them to avoid duplication and focuses on execution.

# Executive Summary
- Approach: API‑first, risk‑based, implementation‑aware testing to maximize defect discovery and evidence within hackathon constraints.
- Focus: P1 risks from RISK_MATRIX.md — Submit, Approve, Balance, Cancel, Reject, Weekday counting, plus status semantics and UTC date validation.
- Method: High-ROI API contracts + targeted E2E critical paths + minimal UI checks for role/employee switching and error feedback. Exploratory charters probe undocumented behaviour and edge cases.
- Tooling: Playwright (APIRequestContext + UI), PostQode AI agents for planning/analysis/documentation with human validation per AGENT.md.
- Outcome: Demonstrable coverage of business-critical flows, verified state transitions, consistent error semantics, and documentation-grade evidence.

# Application Overview
See PROJECT_DISCOVERY.md and MEMORY.md for full architecture, data models, business rules, and API inventory. In short: React 18 + Vite frontend, ASP.NET Core Minimal API backend (single-file Program.cs), in‑memory state, roles Employee/Manager, leave lifecycle Pending → Approved/Rejected/Cancelled.

# Testing Objectives
- Maximize risk-weighted coverage and defect discovery (not test count).
- Validate business‑critical workflows end-to-end with credible evidence.
- Stabilize API contracts and error semantics for deterministic automation.
- Detect state transition, balance integrity, and date validation defects.
- Demonstrate engineering excellence, maintainability, and AI‑assisted productivity.

# Scope
## In Scope
- API validations and error semantics for P1/P2 features (see RISK_MATRIX.md).
- Critical E2E journeys: Submit→Approve (balance consumes), Submit→Reject (reason visible), Submit→Cancel (ownership + pending-only).
- Targeted UI checks: role/employee switching, error feedback, accessibility basics.
- Exploratory sessions on UTC boundary, weekday counting, state conflicts.

## Out of Scope
- Authentication/authorization (not implemented).
- Persistence, backup/restore (in‑memory by design).
- Advanced performance benchmarking or load testing.
- Full WCAG audit — we do heuristic checks only.

## Deferred Activities
- Pagination/filtering UX and backend support.
- Audit/notifications, accrual/carry‑forward policies.
- Deep security hardening (beyond observations in RISK_MATRIX.md).

## Assumptions
- PROJECT_DISCOVERY.md, MEMORY.md, and RISK_MATRIX.md are accurate.
- Backend and frontend run locally with Vite proxy defaults.
- Tests can create and operate on fresh state during the run.

## Dependencies
- Node 20+, .NET 10 SDK, Playwright test runner.
- Stable network loopback to localhost; Vite proxy target reachable.

# Quality Goals
- High confidence in approval/consumption logic and request lifecycle guards.
- Deterministic API automation with precise assertions and failure artifacts.
- Minimal‑flakiness UI checks using accessible names/aria labels.
- Clear traceability from risks → tests → evidence.

# Risk‑Based Testing Strategy
We prioritize per RISK_MATRIX.md. Execution order:
1) P1: Submit, Approve, Cancel, Reject, Balance/Weekday. 2) P2: Past‑date UTC, employee/manager listings, role/employee switching, HTTP status semantics, restart lifecycle. 3) P3: Shell contract drift, enum serialization, dev proxy, a11y basics.

Rationale: These map directly to business impact (entitlements, lifecycle), likelihood (validation/state logic), and automation ROI (API determinism). Lower tiers provide polish without jeopardizing demo outcomes.

# Test Levels
## Static Review
- Code review against AGENT.md focus areas: state guards, balance math, UTC semantics, HTTP status uniformity, selector stability (frontend aria-labels), monolithic coupling risk.

## API Testing
- Primary layer. Use Playwright’s APIRequestContext for deterministic assertions. Validate status codes (400/403/404/409), messages, and record payload shapes. Cover submission/approval/cancellation/rejection matrices and balance scenarios.

## UI Testing
- Narrow scope. Validate navigation, role/employee switching, error feedback rendering, and basic accessibility focus visibility. Use role/name/aria locators to maximize stability.

## End‑to‑End Testing
- Three highest-value workflows:
  - Submit→Approve (balance reduces for limited types)
  - Submit→Reject (reason required and persisted/visible)
  - Submit→Cancel by owner (pending‑only)
- Purpose: Prove cross‑layer wiring and state propagation to UI.

## Exploratory Testing
- Short, focused charters (see section). Aim at UTC boundaries, weekend-only ranges, rapid role/employee toggling, simultaneous manager actions on same request.

## Regression Testing
- A compact smoke set that exercises one path per P1 feature and verifies no regressions in core semantics and status codes.

## Manual Testing
- A11y and usability heuristics (focus-outline, keyboard tab order, message clarity). Responsive spot check of sidebar/main panel.

## Automation Testing
- Playwright test runner, tagged suites (api/ui/e2e/smoke). Artifacts: traces/screenshots on failure; API logs; consistent assertion messages. Centralized helpers for dates and API payloads.

# Test Design Techniques (Applied)
- Boundary Value Analysis: date ordering, single‑day vs weekend‑only, remainingDays edge (0 and near 0).
- Equivalence Partitioning: leave types (limited vs unlimited), statuses (Pending vs terminal), employee IDs (valid vs unknown).
- Decision Tables: approval matrix (type × balance sufficiency × status).
- State Transition Testing: Pending→Approved/Rejected/Cancelled; reject/approve/cancel only from Pending; duplicate approvals.
- Error Guessing: UTC rollover, missing/whitespace reason, invalid enum casing.
- Negative Testing: invalid payloads, unknown employeeId, non‑pending actions.
- Role‑Based Testing: employee vs manager semantics (UI‑driven only).
- Data Integrity Testing: balance after sequences (approve then cancel another, etc.).
- Concurrency Testing: two approvals/rejects racing on same ID (simulated rapid calls).

# Feature‑wise Testing Strategy
(References RISK_MATRIX.md rankings; highlights only strategy, not restating details.)
- Submit: API-first decision tables + BVA on dates; UI form validation message mapping.
- Approve: State‑machine tests; insufficient balance conflicts; duplicate approvals; E2E proof of balance decrement.
- Balance: Property-based scenario generation across mixed approvals; API-only for determinism.
- Cancel: Ownership (403) and pending-only (409) paths; E2E to validate UI messaging; ensure no balance change.
- Reject: Reason required and persisted; UI inline flow; ensure terminal status.
- Weekday Counting: Matrix of ranges (single weekday, weekend-only, spanning week); compare against oracle helper.
- UTC Past-Date: Inject server-relative dates; validate boundary at day change.
- Listings (employee/manager): Filtering correctness and default employeeId=1 behaviour.
- Role/Employee Switching: UI race resilience; verify correct data renders after rapid toggles.
- HTTP Status Semantics: Uniform assertions across all negative paths.

# API Testing Strategy
- Validation: Required fields (leaveType), date rules, employee existence.
- Schema: String enums round-trip; fields presence for request/balance records.
- Status Codes: 200 OK positive paths; 400 for validation; 403 Forbid for unauthorized cancel; 404 for unknown entities; 409 for state conflicts.
- Business Rules: Approval consumes balance for limited types; unpaid unlimited; only Approved affects usedDays.
- Error Handling: Assert message content when present; tolerate 403 without body.
- Boundary Conditions: weekend-only ranges (0 weekdays), end<start, remainingDays near zero.
- Invalid Payloads: bad enum value, missing reason, missing leaveType.
- Idempotency: Not idempotent — assert correct conflict behaviours on repeated actions.
- State Transitions: Enforce Pending-only transitions; ensure terminal states are immutable.
- Concurrency: Fire rapid sequential conflicting actions on same request; expect one success/one conflict.
- Performance Observations: O(n) scans acceptable at demo scale; ensure no timeouts under normal runs.

# UI Testing Strategy
- Navigation: Role-filtered nav items render appropriately (see MEMORY.md); activeNav resets per role.
- Validation: Client-side presence checks for date fields; server errors mapped to feedback.
- Role Behaviour: Role dropdown toggles views; employee selector only in Employee role.
- Accessibility: Use keyboard to traverse; verify visible focus and ARIA labels used as locators.
- Usability: Error text clarity and persistence reset; table readability on mid-size viewports.
- Responsive: Sidebar stickiness at <900px; basic layout integrity.
- Error Messages: Surface server messages; handle 403 without body gracefully.
- Client-side Validation: Required date fields; leave type selection default and reset after submit.

# End‑to‑End Strategy
Prioritized flows:
1) Employee: Submit limited-type leave → Manager: Approve → Employee: Balance shows decrement.
2) Employee: Submit → Manager: Reject with reason → Employee: Reason visible; no balance change.
3) Employee: Submit → Employee: Cancel (pending-only) → Verify status and no balance change.
These maximize business value by proving the entitlement lifecycle and UI visibility.

# Exploratory Testing Strategy (Charters)
- UTC Boundary Charter: Around local midnight vs UTC midnight; submit with startDate borderline.
- Weekend Matrix Charter: Multiple ranges involving Fri–Mon spans and pure weekends.
- Rapid Toggle Charter: Switch role/employee quickly during fetch; observe stale data/race artefacts.
- Conflict Storm Charter: Issue approve+reject near-simultaneously on same request; observe outcomes.
- Error Shape Charter: Force 403/404/409/400 and verify UI messaging behaviours.

# Defect Detection Strategy
Classify findings into: Business (entitlement), Functional (state logic), Validation (input/date), Workflow (transition), UI (render/messaging), API (status/schema), Security (identity spoof observations), Accessibility (focus/contrast), Performance (reloads), Usability (clarity). Provide evidence (API logs, traces, screenshots).

# Automation Strategy
- Framework: Playwright. Separate api/, ui/, e2e/ suites; taggable tests and a smoke subset.
- POM: Lightweight page objects for Sidebar, EmployeeView, ManagerView leveraging aria labels and role selectors.
- Fixtures: API client fixture; date factory to generate weekdays; per‑test isolation via new request data; optional serial grouping to avoid shared state races.
- Parallel: API tests parallel; E2E limited concurrency to avoid state collisions.
- Locators: Prefer getByRole/getByLabelText/aria-labels present in App.jsx; avoid brittle text-only selectors.
- Assertions: Specific, diagnostic messages; status code + payload checks.
- Logging/Reporting: Enable Playwright trace on failure; API request/response logging; concise HTML report.
- Reusability: Central helpers for request creation/cancellation/approval; date utilities; response validators.
- Maintainability: Small, intention‑revealing tests; central constants for endpoints and statuses; selectors centralized.

# AI‑Assisted Quality Engineering Strategy
- Where AI is used: repository understanding, risk analysis, scenario generation, code review hints, documentation, coverage gap analysis.
- Human judgement: risk prioritization, assertion design, oracle choice, final sign‑off.
- Validation: All AI outputs cross‑checked against source, PROJECT_DISCOVERY.md and MEMORY.md; assumptions flagged.
- Acceleration: MCP Planner for plan, MCP Generator for boilerplate/doc scaffolds, WebAgent/APIClient for quick probes; Healer used only for refactors with review.
- Token efficiency: Reuse of PROJECT_DISCOVERY.md, AGENT.md, MEMORY.md, RISK_MATRIX.md to avoid rediscovery and long prompts.

# Test Data Strategy
- Seed Data: Fixed employees (IDs 1–5).
- Independence: Generate date ranges programmatically to ensure weekdays; prefer unique requests per test.
- Setup: Use API to create preconditions (submit before approve/reject/cancel).
- Cleanup: Terminal states are immutable; rely on isolated data rather than teardown; in‑memory state resets on process restart when needed.
- Data Reuse: Avoid cross‑test dependencies; share only helper factories.

# Entry Criteria
- Backend and frontend running locally; proxy verified.
- Baseline smoke API calls succeed (health, employees).
- AGENT.md, MEMORY.md, PROJECT_DISCOVERY.md, RISK_MATRIX.md in place.

# Exit Criteria
- P1 risks covered by passing automated tests with evidence.
- Critical E2E workflows pass and demonstrate expected balance/visibility effects.
- No unexplained failures/flakes in smoke set.
- Documented defects and residual risks acknowledged.

# Deliverables
- Test Strategy (this document)
- Risk Matrix (updated)
- Coverage Matrix and RTM (risks→tests mapping)
- API Tests (Playwright)
- UI Tests (Playwright)
- E2E Tests (Playwright)
- Exploratory Testing Notes (charters + findings)
- Defect Report (categorized)
- Enhancement Recommendations
- AI Usage Summary
- Hackathon Approach recap
- Quality Decisions log
- Release Recommendation

# Risks and Trade‑offs
Intentionally not tested in depth: authentication/authorization, persistence durability, high‑scale performance, complete WCAG conformance. Business impact is limited for this demo scope; residual risk documented for post‑hackathon hardening.

# Success Metrics
- Coverage of all P1 risks with automated checks.
- ≥2 critical E2E workflows green with artifacts.
- ≥1 defect per high‑risk area investigated or explicitly cleared.
- Stable, reproducible API tests (no flakiness across two runs).
- Clear traceability from risk to test to evidence.
- Concise documentation enabling judge verification under time constraints.

# Final Quality Assessment
- Confidence: Moderate‑High for business‑critical flows (approval, balance, cancellation, rejection) based on API/E2E validations.
- Release Recommendation (demo context): Proceed, with documented residual risks in security (no auth), durability (in‑memory), and a11y.
- Areas for future validation: authz/authn, persistence, pagination, audit/notifications, broader a11y.

# Why This Strategy Maximizes Value Under Hackathon Constraints
- API‑first priority: Backend enforces rules; API tests are deterministic, faster, and cover more branches (status codes/validation/transition) per minute than UI. This yields higher defect discovery and clearer evidence.
- Risk‑based automation: Automating P1/P2 paths (not everything) maximizes ROI by catching state and entitlement defects that would be most damaging in demo scenarios.
- Exploratory focus on unknowns: Charters target undocumented behaviour (UTC boundaries, weekend counting, races), where real defects often hide — not just restating docs.
- AI as accelerator, not replacement: AI distilled repo context, risks, and scenarios; humans set oracles, scrutinized rules/state transitions, and approved decisions. This ensured speed without sacrificing correctness.
- Token minimization: We centralized context in PROJECT_DISCOVERY.md, AGENT.md, MEMORY.md, and RISK_MATRIX.md, enabling short, high‑signal prompts and avoiding repeated rediscovery of facts.
- Outcome: Greater risk coverage, better documentation, and more meaningful defects within 5 hours by focusing on highest business impact and deterministic layers.
- This is senior‑level quality engineering: clear prioritization, strong oracles, maintainable automation, and evidence‑driven decisions — not test‑count maximization.
