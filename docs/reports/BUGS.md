# BUGS.md

Confirmed application defects discovered through automation and triage.

Status markers:
- ✅ Implemented / fixed
- 🟡 Planned / recommended
- ⚪ Out of Scope
- ❌ Open defect

## BUG-001 — Unauthorized cancellation returns 500 instead of 403

- Status: ❌ Open
- Requirements: REQ-009, REQ-019 (REQ-016 path context)
- Coverage IDs: API-007 (primary), API status semantics checks
- Component: Backend cancellation endpoint
- Severity: High
- Priority: P1

### Summary
When a non-owner attempts cancellation, the API returns **HTTP 500** instead of the expected **HTTP 403**.

### Steps to Reproduce
1. Create a pending leave request for `employeeId=1`.
2. Attempt cancellation for the same request as a different employee (e.g., `employeeId=2`).
3. Observe HTTP 500.

### Expected
- HTTP 403 Forbid semantics for unauthorized cancellation attempts.

### Actual
- HTTP 500 Internal Server Error.

### Evidence
- API execution includes 3 failures; BUG-001 accounts for cancellation semantics failures.
- Related tests: cancellation workflow + status semantics checks.
- See synchronized analysis: [TEST_ANALYSIS_REPORT.md](./TEST_ANALYSIS_REPORT.md)

### Technical Note
`Results.Forbid()` without configured auth scheme can produce 500 in ASP.NET Core minimal API setups.

### Recommendation
🟡 Return explicit HTTP 403 in this path (or introduce proper auth scheme configuration before using framework-specific forbid handlers).

### Business Impact
High impact on API contract reliability and negative-path confidence for evaluation criteria.
