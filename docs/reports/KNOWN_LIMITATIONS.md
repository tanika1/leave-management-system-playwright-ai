# KNOWN_LIMITATIONS.md

Genuine product/environment limitations that are not classified as standalone test-script defects.

Status markers:
- ✅ Implemented mitigation available
- 🟡 Planned / Recommended mitigation
- ⚪ Out of Scope / Not Implemented in product

## 1) In-memory State (No Persistence)
- Status: ⚪ Out of Scope
- Limitation: Backend stores leave requests in process memory and resets on restart.
- Impact: Data continuity across restarts is not guaranteed.

## 2) No Authentication/Authorization Framework
- Status: ⚪ Out of Scope
- Limitation: Authn/authz model is not implemented.
- Impact: Security semantics are limited; cancellation path defect manifests as [BUG-001](./BUGS.md#bug-001--unauthorized-cancellation-returns-500-instead-of-403) in current setup.

## 3) Parallel Execution on Shared In-Memory Data
- Status: ✅ Implemented mitigation + 🟡 residual risk
- Limitation: Parallel workers can contend over shared employee-state snapshots.
- Implemented mitigation: worker-aware employee allocation strategy documented in framework/analysis docs.
- Residual risk: balance-sensitive checks can still require targeted isolated verification in some runs.

## 4) No Pagination/Filtering for Request Lists
- Status: ⚪ Out of Scope
- Limitation: Request grids lack pagination/filtering controls.
- Impact: Large-data UX and validation depth are constrained.

## 5) No Holiday Calendar in Day Counting
- Status: ⚪ Out of Scope
- Limitation: Weekday logic excludes weekends only.
- Impact: Real-world holiday policy scenarios are not represented.

---

## Recommended Follow-up (Non-blocking)
- 🟡 Add persistence and deterministic seeded reset controls.
- 🟡 Implement authn/authz before asserting production-grade authorization semantics.
- 🟡 Expand non-functional coverage (performance/concurrency depth).
