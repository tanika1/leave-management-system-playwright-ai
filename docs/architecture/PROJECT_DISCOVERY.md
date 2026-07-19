# PROJECT_DISCOVERY.md

## 1) Verified Facts

### 1.1 Project Identity and Scope
- Repository: `leave-management-system`
- Application type: full-stack Leave Management System
- Primary user-facing capabilities:
  - Employee submits leave requests
  - Employee cancels own pending requests
  - Manager approves/rejects requests
  - Manager must provide reason when rejecting
- Data storage: in-memory backend state (`LeaveState._requests`), reset on backend restart

### 1.2 Technology Stack
- **Frontend**
  - React 18 (`react`, `react-dom`)
  - Vite 5 (`vite`)
  - JavaScript (ES modules), no TypeScript
  - CSS in `frontend/src/styles.css`
- **Backend**
  - ASP.NET Core Minimal API
  - .NET 10 (`TargetFramework: net10.0`)
  - JSON enum serialization enabled via `JsonStringEnumConverter`
- **Build/Run**
  - Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`
  - Backend: `dotnet run`

### 1.3 Repository / Folder Structure (Observed)
```text
leave-management-system/
├── .gitignore
├── README.md
├── package-lock.json
├── backend/
│   ├── LMS.csproj
│   ├── Program.cs
│   ├── bin/
│   └── obj/
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

### 1.4 Architecture
- Split frontend/backend architecture.
- Frontend calls backend via HTTP endpoints under `/api/*`.
- Vite dev server proxies `/api` to backend target from `VITE_PROXY_TARGET` (default `http://localhost:5000`).
- Backend is implemented largely in a single file: `backend/Program.cs`, containing:
  - endpoint mapping
  - domain enums/records
  - shell contract
  - employee registry
  - leave policy functions
  - leave state management and workflow logic

### 1.5 Frontend Architecture
- Entry bootstrap: `frontend/src/main.jsx` renders `<App />` in `React.StrictMode`.
- Main UI composition in `frontend/src/App.jsx`:
  - `App` (shell, role switcher, employee selector, nav)
  - `EmployeeView` (balance + submit + my requests + cancel)
  - `ManagerView` (team requests + approve/reject)
  - `BalanceBreakdown` (balance table)
- Frontend constants:
  - Roles: `Employee`, `Manager`
  - Leave types: `Annual`, `Sick`, `Casual`, `Unpaid`
  - Nav item arrays for employee and manager contexts
- API URL strategy:
  - If `VITE_API_BASE_URL` exists, prepend it.
  - Otherwise use relative URLs (works with proxy).

### 1.6 Backend Architecture
- Service setup:
  - `builder.Services.ConfigureHttpJsonOptions` adds `JsonStringEnumConverter`.
- Runtime objects:
  - `EmployeeRegistry employeeRegistry = new EmployeeRegistry();`
  - `LeaveState leaveState = new LeaveState(employeeRegistry);`
  - `ShellState shellState = new ShellState(...)`
- Routes mapped directly on `app` instance.
- Core domain modules/classes in `Program.cs`:
  - `ShellContract`
  - `EmployeeRegistry`
  - `LeavePolicy`
  - `LeaveState`

### 1.7 Component Hierarchy (Frontend)
```text
main.jsx
└── App
    ├── Sidebar
    │   ├── Role selector
    │   ├── Employee selector (Employee role only)
    │   └── Navigation list
    └── Main panel
        ├── EmployeeView (if role=Employee)
        │   ├── BalanceBreakdown
        │   ├── Leave request form
        │   └── My leave requests table
        └── ManagerView (if role=Manager)
            └── Team leave requests table (approve/reject actions)
```

### 1.8 API Inventory (Verified)

#### Health / Shell
- `GET /api/health`
- `GET /api/shell`

#### Employee registry
- `GET /api/employees`

#### Employee scope
- `GET /api/employee/balance?employeeId={id}`
- `GET /api/employee/leave-requests?employeeId={id}`
- `POST /api/employee/leave-requests` (body: `LeaveRequestInput`)
- `POST /api/employee/leave-requests/{id:int}/cancel?employeeId={id}`

#### Manager scope
- `GET /api/manager/leave-requests`
- `POST /api/manager/leave-requests/{id:int}/approve`
- `POST /api/manager/leave-requests/{id:int}/reject` (body: `RejectionInput`)

### 1.9 Data Models and Enums (Backend)

#### Enums
- `UserRole`: Employee, Manager
- `LeaveType`: Annual, Sick, Casual, Unpaid
- `LeaveRequestStatus`: Pending, Approved, Cancelled, Rejected
- `ApprovalError`: None, NotFound, AlreadyApproved, NotPending, InsufficientBalance
- `CancellationError`: None, NotFound, NotPending, Unauthorized
- `RejectionError`: None, NotFound, NotPending, MissingReason

#### Records
- `ShellState(string[] Navigation, UserRole[] Roles)`
- `EmployeeRecord(int Id, string Name)`
- `LeaveRequestInput(DateOnly StartDate, DateOnly EndDate, LeaveType? LeaveType = null, int? EmployeeId = null)`
- `RejectionInput(string? Reason)`
- `LeaveRequestRecord(int Id, int EmployeeId, string EmployeeName, LeaveType LeaveType, DateOnly StartDate, DateOnly EndDate, int Days, LeaveRequestStatus Status, string? Reason = null)`
- `LeaveBalance(int UsedDays, int RemainingDays)`
- `LeaveTypeBalance(string LeaveType, bool IsUnlimited, int BaselineDays, int UsedDays, int? RemainingDays)`
- `LeaveSubmissionResult(bool Success, string Message, LeaveRequestRecord? Request, int RemainingDays)`
- `LeaveApprovalResult(bool Success, string Message, LeaveRequestRecord? Request, ApprovalError Error)`
- `LeaveCancellationResult(bool Success, string Message, LeaveRequestRecord? Request, CancellationError Error)`
- `LeaveRejectionResult(bool Success, string Message, LeaveRequestRecord? Request, RejectionError Error)`

### 1.10 Business Logic and Validation Rules (Verified)

#### Employee existence checks
- Employee-scoped endpoints validate employee existence and return `404` if unknown.

#### Submission rules (`TrySubmitLeaveRequest`)
- `leaveType` required.
- `leaveType` must be a recognized enum value.
- `endDate` cannot be before `startDate`.
- `startDate` cannot be in the past relative to backend `DateTime.UtcNow` date.
- Requested days counted as weekdays only (Mon-Fri).
- Range with zero weekdays rejected.
- Submission allowed even if balance appears insufficient; balance is enforced at approval.

#### Approval rules (`TryApproveLeaveRequest`)
- Request must exist.
- Request cannot already be approved.
- Request must be pending.
- For non-unpaid leave types, requested days must not exceed remaining balance.
- Unpaid leave bypasses balance limit.

#### Rejection rules (`TryRejectLeaveRequest`)
- Input reason required and must not be null/whitespace.
- Request must exist.
- Request must be pending.
- Rejected request stores reason.

#### Cancellation rules (`TryCancelLeaveRequest`)
- Request must exist.
- Request must belong to requesting employee (`employeeId` check).
- Request must be pending.

### 1.11 Application Workflow

#### End-to-end functional flow
1. User opens frontend app.
2. App loads employee list for selector.
3. Employee role:
   - load balance + own requests
   - submit request (pending state)
   - optionally cancel pending request
4. Manager role:
   - load all requests
   - approve pending request OR reject with reason
5. Employee sees updated status and (when approved) updated balance usage.

### 1.12 Role Workflow (Implemented Behavior)
- Role selection is UI-controlled dropdown.
- Employee role shows employee selector and employee nav items.
- Manager role shows manager nav items.
- Backend endpoints do not enforce authenticated role identity.

### 1.13 State Transitions (Verified)
```text
Pending -> Approved
Pending -> Rejected
Pending -> Cancelled

Approved  -> (no further transition)
Rejected  -> (no further transition)
Cancelled -> (no further transition)
```

### 1.14 Dependencies (Observed)
- Frontend runtime deps: `react`, `react-dom`
- Frontend dev dep: `vite`
- Backend uses ASP.NET Core SDK (`Microsoft.NET.Sdk.Web`), no additional NuGet package refs in csproj

### 1.15 Configuration and Environment Variables
- `VITE_PROXY_TARGET`
  - Loaded in `vite.config.js`
  - Default: `http://localhost:5000`
  - Used by Vite dev proxy for `/api`
- `VITE_API_BASE_URL`
  - Read in frontend `App.jsx`
  - If set, frontend uses it as API base

### 1.16 Business-Critical Modules (Source-Derived)
- `LeaveState.TrySubmitLeaveRequest`
- `LeaveState.TryApproveLeaveRequest`
- `LeaveState.TryCancelLeaveRequest`
- `LeaveState.TryRejectLeaveRequest`
- `LeaveState.GetBalanceBreakdown` and `GetBalance`
- Frontend `EmployeeView` and `ManagerView` request/action handlers

---

## 2) Architecture Diagram (Text)

```text
┌─────────────────────────────────────────────┐
│                 Frontend                    │
│         React + Vite (App.jsx)             │
│                                             │
│  App Shell                                  │
│   ├─ Role Switcher                          │
│   ├─ Employee Selector (employee role)      │
│   ├─ EmployeeView                           │
│   │   ├─ BalanceBreakdown                   │
│   │   ├─ Submit Request Form                │
│   │   └─ My Requests + Cancel               │
│   └─ ManagerView                            │
│       └─ Team Requests + Approve/Reject     │
└─────────────────────────────────────────────┘
                    │
                    │ HTTP /api/*
                    ▼
┌─────────────────────────────────────────────┐
│                 Backend                     │
│      ASP.NET Core Minimal API               │
│                                             │
│  Endpoints                                  │
│   ├─ Health/Shell                           │
│   ├─ Employees                              │
│   ├─ Employee endpoints                     │
│   └─ Manager endpoints                      │
│                                             │
│  Domain + State (Program.cs)                │
│   ├─ EmployeeRegistry (static list)         │
│   ├─ LeavePolicy (baselines/weekdays)       │
│   └─ LeaveState (in-memory requests)        │
└─────────────────────────────────────────────┘
```

---

## 3) Module Dependency Map

```text
Frontend
main.jsx
  -> App.jsx
      -> Role/nav constants
      -> EmployeeView
          -> fetch /api/employee/balance
          -> fetch /api/employee/leave-requests
          -> POST /api/employee/leave-requests
          -> POST /api/employee/leave-requests/{id}/cancel
      -> ManagerView
          -> GET /api/manager/leave-requests
          -> POST /api/manager/leave-requests/{id}/approve
          -> POST /api/manager/leave-requests/{id}/reject
      -> GET /api/employees (for selector)

Backend
Program.cs endpoints
  -> EmployeeRegistry (Exists/GetAll/GetName)
  -> LeaveState
      -> LeavePolicy (GetBaseline/IsUnlimited/CountWeekdays)
      -> in-memory _requests list
  -> ShellContract (navigation + roles)
```

---

## 4) API Map (Operation-Centric)

```text
/health
  GET /api/health

/shell
  GET /api/shell

/employees
  GET /api/employees

/employee
  GET  /api/employee/balance?employeeId=
  GET  /api/employee/leave-requests?employeeId=
  POST /api/employee/leave-requests
  POST /api/employee/leave-requests/{id}/cancel?employeeId=

/manager
  GET  /api/manager/leave-requests
  POST /api/manager/leave-requests/{id}/approve
  POST /api/manager/leave-requests/{id}/reject
```

---

## 5) Workflow Diagram

```text
Employee submits request
  -> status = Pending
  -> visible in employee list + manager list

Manager decision on Pending request
  -> Approve
       -> if non-Unpaid and remaining balance insufficient: conflict
       -> else status = Approved
  -> Reject (reason required)
       -> status = Rejected, reason saved

Employee can cancel own Pending request
  -> status = Cancelled

Balance consumption
  -> only Approved requests reduce remaining days (except Unpaid unlimited model)
```

---

## 6) State Transition Diagram

```text
                +-----------+
                |  Pending  |
                +-----------+
                 /    |    \
                /     |     \
         Approve   Reject    Cancel
              /       |         \
             v        v          v
      +----------+ +----------+ +-----------+
      | Approved | | Rejected | | Cancelled |
      +----------+ +----------+ +-----------+

Approved/Rejected/Cancelled are terminal in current implementation.
```

---

## 7) Potential Testing Hotspots (Source-Informed)

### 7.1 High Hotspots
- `LeaveState.TryApproveLeaveRequest`
  - state guard logic + balance gate + multiple conflict paths
- `LeaveState.GetBalance` / `GetBalanceBreakdown`
  - correctness of aggregation by status/type
- `LeavePolicy.CountWeekdays`
  - date arithmetic correctness and off-by-one risks
- Employee/manager action handlers in `App.jsx`
  - async fetch handling and error messaging paths

### 7.2 Medium Hotspots
- Role switching and employee switching interactions
- Reject inline workflow (`rejectingId`, `rejectReason` state handling)
- Endpoint status code behavior consistency (`400/403/404/409`)

### 7.3 Lower Hotspots
- Shell metadata endpoint and nav filtering synchronization
- Static employee registry retrieval

---

## 8) Recommended Testing Priority (Risk-Oriented Discovery Priority)

1. Approval path and conflict branches
2. Submission validation matrix (date, type, zero weekday)
3. Balance computations after multi-request scenarios
4. Cancellation authorization and state constraints
5. Rejection reason validation and persistence
6. Role/employee switch behavior during asynchronous loads
7. API contract consistency and error payload shapes
8. Environment config behavior (`VITE_PROXY_TARGET`, `VITE_API_BASE_URL`)

---

## 9) Potential Risk Areas by Category (Source-Based)

### 9.1 Potential Architectural Weaknesses
- Backend is monolithic in one file, increasing coupling between routing/domain/state.
- In-memory data model provides no durability across restarts.
- No persistence abstraction layer; direct list mutation in core workflow.

### 9.2 Potential Security Risks
- No authentication/authorization infrastructure.
- Manager endpoints exposed without role verification.
- Employee identity is client-supplied (`employeeId` query/body).
- Unauthorized cancel path returns `Forbid` without structured message body.

### 9.3 Potential Concurrency Risks
- Shared mutable `_requests` list used for all operations.
- No explicit synchronization/locking around state transitions.
- Concurrent approve/reject/cancel operations on same ID may race.

### 9.4 Potential Data Integrity Risks
- Data loss on process restart.
- Integrity depends on transition guards in memory only.
- No immutable event/audit history beyond current record state.

### 9.5 Potential Usability Risks
- Backend date validation uses UTC day; users likely reason in local date.
- Feedback text depends on varied backend error payload styles.
- Large tables in current UI may become hard to scan at scale (no pagination/filtering).

### 9.6 Potential Accessibility Issues (from current markup/CSS patterns)
- Custom styled controls/buttons with no explicit focus-visible styles found in CSS.
- Status colors carry semantic meaning; text exists but visual reliance on color remains significant.
- Dense tabular layouts may be challenging on small viewports.

### 9.7 Potential Performance Bottlenecks
- Backend recalculates balances by scanning all approved requests for each type.
- Multiple operations repeatedly enumerate `_requests` list.
- Frontend performs full list reload after many actions.

### 9.8 Potential Maintainability Issues / Code Smells
- Backend single-file implementation contains mixed concerns (routing + models + logic + state).
- Limited separation of domain services, repositories, and endpoint layers.
- Frontend view logic concentrated in a single `App.jsx` file.
- Duplicate fetch/error handling patterns could be centralized.

### 9.9 High Complexity Modules
- `LeaveState` transition and balance logic.
- Frontend `App.jsx` due to multi-role state + async orchestration.

### 9.10 High Defect Probability Modules
- Approval and cancellation transition branches.
- Date handling and weekday counting.
- Cross-role UI state transitions and async updates.

---

## 10) Business Assumptions, Hidden Assumptions, Implicit Rules

### 10.1 Verified Explicit Assumptions in Code/Docs
- Employee roster is fixed and pre-seeded (5 users).
- Baseline leave per type is static constants.
- Unpaid leave is unlimited.
- Only approved requests consume leave balance.

### 10.2 Hidden/Implicit Assumptions (Reasonable Inferences)
- Role selected in UI is treated as trusted context for visible actions.
- Any caller can invoke manager APIs (no identity check at API boundary).
- System assumes low scale where in-memory list scans are acceptable.
- Date-only logic assumes no holiday calendar and no timezone-localized policy.

---

## 11) Missing Requirements (Observed Gaps)
- No documented policy for overlapping leave date ranges.
- No documented accrual/carry-forward/leave-year reset logic.
- No manager hierarchy/scope rules (who can approve whom).
- No audit trail requirements (who approved/rejected and when beyond state update).
- No notification requirements.
- No data retention/export requirements.
- No SLA/non-functional targets (performance, availability, security controls).

---

## 12) Unknowns Requiring Exploratory Testing
- Behavior at UTC day boundaries vs user local date for submission validation.
- System behavior under rapid repeated approvals/rejections/cancellations.
- Consistency when UI role/employee is switched during in-flight fetches.
- Error rendering behavior when backend returns non-JSON or empty response bodies.
- Large-volume request behavior in manager table and balance recalculation performance.

---

## 13) Reasonable Inferences
- This codebase is intentionally sample/demo-oriented (minimal architecture, no persistence/auth).
- Production readiness would require explicit identity, authorization, persistence, and audit layers.
- Current design prioritizes functional clarity over layered architecture.

---

## 14) Open Questions Discovered from Source Code
1. What is the intended identity/auth model for Employee and Manager operations?
2. Should manager approval rights be constrained to specific teams/managers?
3. Should overlapping leave requests be allowed for same employee/date range?
4. Should leave submission block when remaining balance is already insufficient (currently blocked only at approval)?
5. What are expected timezone semantics for date validation (UTC vs user locale)?
6. Should rejected/cancelled requests support reopen/resubmit transitions?
7. Is there a requirement for persistence, audit logs, and recovery across restarts?
8. What is expected behavior for high request volumes (pagination/filtering/sorting)?
9. Should API error contracts be standardized for all failure paths including `403`?
10. Are accessibility standards (e.g., WCAG target level) required for hackathon judging or product scope?

---

## 15) Verified Facts vs Inferences vs Open Questions (Quick Index)

### Verified Facts
- Stack, endpoints, models, workflows, validation, state transitions, in-memory storage, env config, and current module layout as documented above.

### Reasonable Inferences
- Demo-oriented implementation choices, potential scale/security/maintainability concerns inferred from structure and absence of controls.

### Open Questions
- Identity/authorization scope, policy completeness, overlap rules, timezone policy, persistence/audit requirements, and NFR expectations.
