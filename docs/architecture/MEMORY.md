# MEMORY.md

## Architecture
- Full-stack split application with separate frontend and backend projects.
- Frontend communicates with backend through `/api/*` HTTP endpoints.
- Vite dev proxy forwards `/api` to backend target (`VITE_PROXY_TARGET`, default `http://localhost:5000`).
- Backend is implemented primarily in `backend/Program.cs`, containing routes, domain models, policy logic, and in-memory state management.
- Backend state is held in memory via `LeaveState` and is reset on process restart.

## Technology
- Frontend: React 18, ReactDOM 18, Vite 5, JavaScript ES modules.
- Backend: ASP.NET Core Minimal API on .NET 10 (`net10.0`).
- Serialization: `JsonStringEnumConverter` enabled for enum string JSON handling.
- Frontend scripts: `dev`, `build`, `preview`.
- Backend run mode: `dotnet run`.

## Modules
- Frontend modules:
  - App shell (`App.jsx`) with role switcher and navigation.
  - Employee view: balance, submit request, request list, cancel action.
  - Manager view: team request list, approve action, reject action with reason.
  - Bootstrap (`main.jsx`) and styling (`styles.css`).
- Backend modules (logical, all in `Program.cs`):
  - Health and shell endpoints.
  - Employee registry endpoint.
  - Employee leave endpoints.
  - Manager leave endpoints.
  - `EmployeeRegistry` (static seeded users).
  - `LeavePolicy` (baselines, unlimited leave, weekday counting).
  - `LeaveState` (request lifecycle, validation, balance computation).

## Business Rules
- Leave types: `Annual`, `Sick`, `Casual`, `Unpaid`.
- Pre-seeded employees are fixed (IDs 1–5).
- Baseline leave entitlement:
  - Annual: 15
  - Sick: 10
  - Casual: 5
  - Unpaid: unlimited
- Submission validation:
  - `leaveType` is required and must be valid.
  - `endDate` cannot be before `startDate`.
  - `startDate` cannot be in the past (backend compares with UTC current date).
  - Requested days are weekdays only (Mon–Fri).
  - Date ranges with zero weekdays are rejected.
- Balance behavior:
  - Only approved requests consume leave balance.
  - Submission does not enforce remaining balance for limited leave types.
  - Balance is enforced at approval time for non-unpaid leave.
- Approval behavior:
  - Only pending requests can be approved.
  - Non-unpaid requests fail approval when remaining balance is insufficient.
  - Unpaid requests bypass balance checks.
- Rejection behavior:
  - Only pending requests can be rejected.
  - Rejection reason is mandatory and cannot be whitespace.
  - Rejection reason is stored on the request.
- Cancellation behavior:
  - Only pending requests can be cancelled.
  - Employee can cancel only own request.

## API Inventory
- Health/Shell:
  - `GET /api/health`
  - `GET /api/shell`
- Employees:
  - `GET /api/employees`
- Employee scope:
  - `GET /api/employee/balance?employeeId={id}`
  - `GET /api/employee/leave-requests?employeeId={id}`
  - `POST /api/employee/leave-requests`
  - `POST /api/employee/leave-requests/{id}/cancel?employeeId={id}`
- Manager scope:
  - `GET /api/manager/leave-requests`
  - `POST /api/manager/leave-requests/{id}/approve`
  - `POST /api/manager/leave-requests/{id}/reject`

## UI Flows
- On app load, frontend fetches employee list for selector.
- Employee role flow:
  - Load leave balance and own requests.
  - Submit leave request.
  - Cancel pending own request.
- Manager role flow:
  - Load all team requests.
  - Approve pending request.
  - Reject pending request with reason.
- Role change updates visible nav and active view.
- Employee selector is shown only in Employee role.

## State Transitions
- Request lifecycle states: `Pending`, `Approved`, `Rejected`, `Cancelled`.
- Allowed transitions:
  - `Pending -> Approved`
  - `Pending -> Rejected`
  - `Pending -> Cancelled`
- Terminal states: `Approved`, `Rejected`, `Cancelled` do not transition further.

## Data Model
- Enums:
  - `UserRole`, `LeaveType`, `LeaveRequestStatus`
  - `ApprovalError`, `CancellationError`, `RejectionError`
- Core records:
  - `EmployeeRecord`
  - `LeaveRequestInput`
  - `RejectionInput`
  - `LeaveRequestRecord`
  - `LeaveBalance`
  - `LeaveTypeBalance`
  - Result records for submission, approval, cancellation, rejection
  - `ShellState`
- Key state containers:
  - `EmployeeRegistry` static employee list
  - `LeaveState._requests` in-memory request collection

## Known Constraints
- No authentication or server-side role authorization is implemented.
- Identity context is client-provided (`employeeId` in query/body).
- Backend and frontend role behavior is primarily UI-driven.
- Backend implementation is concentrated in a single `Program.cs` file.
- Vite proxy behavior depends on environment configuration.

## Known Limitations
- No database persistence; all leave request data is volatile.
- No employee CRUD operations.
- No holiday calendar logic; only weekends are excluded from day count.
- No multi-approver/delegation/escalation workflow.
- No pagination/filtering/sorting for leave requests.
- No documented audit trail, notifications, or accrual/carry-forward policies in source.

## High-Risk Areas
- Leave request approval decision path and conflict handling.
- Leave balance calculations and post-transition consistency.
- Date validation and weekday counting logic.
- Ownership and authorization checks for cancellation.
- UI role/employee switching with asynchronous data loading.
- Error handling consistency across backend statuses and frontend feedback.

## Testing Hotspots
- Approval branches: not found, already approved, not pending, insufficient balance.
- Submission validation matrix: leave type, date ordering, past date, zero-weekday ranges.
- Balance integrity after mixed sequences of approve/reject/cancel actions.
- Reject flow validation and reason persistence.
- Status-code and message consistency for 400/403/404/409 pathways.
- Role switch + employee switch behavior during in-flight API operations.

## Code Hotspots
- Backend:
  - `LeaveState.TryApproveLeaveRequest`
  - `LeaveState.TrySubmitLeaveRequest`
  - `LeaveState.TryCancelLeaveRequest`
  - `LeaveState.TryRejectLeaveRequest`
  - `LeaveState.GetBalance` / `GetBalanceBreakdown`
  - `LeavePolicy.CountWeekdays`
- Frontend:
  - `App.jsx` role state and navigation control
  - `EmployeeView` fetch/submit/cancel handlers
  - `ManagerView` approve/reject handlers and inline reject state

## Assumptions
- Backend date validation uses UTC date as source of truth for past-date checks.
- Role selection in UI determines available actions shown in UI.
- Current implementation assumes low-scale, in-memory operation without persistence.

## Open Questions
- Intended authentication and authorization model for Employee and Manager actions.
- Whether manager approval scope should be restricted by reporting hierarchy/team.
- Expected policy for overlapping leave requests.
- Whether leave should be blocked at submission when balance is insufficient (currently enforced at approval).
- Required timezone policy for date validation (UTC vs user-local semantics).
- Whether terminal requests should ever be reopenable/resubmittable in-place.
- Required persistence, audit, and retention expectations.
- Required list scalability features (pagination/filtering/sorting).
- Expected standard for uniform API error response schema (including 403).
- Required accessibility conformance level.

## Newly Discovered Behaviors
- Employee-scoped endpoints can default `employeeId` to `1` when omitted in mapped parameters.
- Unauthorized cancellation returns `403 Forbid` without custom JSON message body.
- Non-pending approve/reject/cancel paths return conflict responses (`409`) except explicit not-found or validation errors.
- `/api/shell` returns full navigation and role contract; frontend applies role-based navigation filtering.
- Frontend uses `VITE_API_BASE_URL` when provided; otherwise relative `/api` routes are used.
