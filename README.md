# Leave Management System — Test Automation Framework

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.46%2B-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Overall Pass Rate](https://img.shields.io/badge/Overall%20Pass%20Rate-91.9%25-brightgreen)

Production-grade, risk-based **Playwright + TypeScript** automation framework for a Leave Management System (LMS), developed during **The Test Chat – AI Test Hackathon** using modern Quality Engineering practices, layered architecture, and evidence-driven test reporting.

---

## 1) Project Overview

This repository contains a production-style **Playwright + TypeScript** automation framework designed to validate a Leave Management System (LMS) through a comprehensive multi-layer testing strategy.

The framework focuses on delivering fast, reliable, and maintainable automated validation across the application's highest-risk business workflows while demonstrating production-quality automation engineering practices.

Implemented test layers include:

- **API Testing** – business rules, validation, workflow transitions, contract verification, and HTTP status semantics
- **UI Testing** – role-based navigation, form validation, synchronization, accessibility-first interactions, and user-visible behavior
- **End-to-End (E2E) Testing** – critical business workflows covering complete user journeys across the application

Key engineering principles adopted throughout the framework include:

- Risk-based test prioritization
- Layered, maintainable framework architecture
- Requirement-to-test traceability
- Evidence-driven defect reporting
- Parallel execution with isolated test data
- Production-ready coding standards and reusable automation components

---

## 2) Application Under Test (AUT)

This automation framework validates the **Leave Management System (LMS)** provided as the official application for **The Test Chat – AI Test Hackathon**.

| Item | Details |
|------|---------|
| Application | Leave Management System (LMS) |
| Event | The Test Chat – AI Test Hackathon |
| AUT Repository | https://github.com/postqode/postqode-community |
| Hackathon Repository | https://github.com/postqode/postqode-community/tree/main/samples/apps/leave-management-system |
| Application Owner | Postqode / The Test Chat |
| This Repository | Independent Playwright + TypeScript automation framework containing test implementation, framework architecture, documentation, execution evidence, bug reports, enhancement recommendations, RTM, coverage matrix, and supporting quality engineering artifacts. |

> **Note:** The Application Under Test (AUT) is maintained separately by the hackathon organizers. This repository contains **only the automation framework and quality engineering deliverables** and does not include the application's source code.

---

## 3) Hackathon Objective

Deliver maximum quality signal in limited time by prioritizing:
1. High-impact risk areas first
2. API-first deterministic automation
3. Requirement-to-test traceability
4. Judge-ready defect evidence and execution reporting

---

## 4) Key Capabilities

- ✅ **Playwright + TypeScript** automation architecture
- ✅ **UI, API, E2E** layered coverage
- ✅ **Risk-based automation** driven by prioritized matrix
- ✅ **Requirement Traceability Matrix (RTM)** alignment
- ✅ **Coverage Matrix** with execution status and residual risk
- ✅ **Bug & Enhancement tracking** with IDs and reproducible evidence
- ✅ **Parallel execution support** with worker-aware data isolation
- ✅ **Accessibility-first locators** (`getByRole`, `getByLabel`, ARIA-first)

---

## 5) Framework Architecture (High-Level)

```text
tests (api/ui/e2e)
  -> fixtures
      -> api clients / pages / components
          -> models / constants / utils
              -> config
```

```text
.
├── api/                # Typed API wrappers
├── components/         # Reusable UI component abstractions
├── config/             # Env + Playwright config helpers
├── constants/          # Endpoints, enums, selectors, tags
├── docs/               # Architecture, strategy, reports
├── fixtures/           # Shared test fixtures and data allocators
├── hooks/              # Global setup/teardown
├── models/             # API and domain types
├── pages/              # Page objects
├── tests/
│   ├── api/
│   ├── ui/
│   └── e2e/
├── utils/              # Reusable helpers
├── reports/            # HTML + JUnit outputs
└── artifacts/          # Execution artifacts
```

---

## 6) Tech Stack

| Area | Technology |
|---|---|
| Language | TypeScript |
| Test Runner | Playwright Test |
| API Layer | Playwright `APIRequestContext` |
| UI/E2E Layer | Playwright browser automation |
| Runtime | Node.js 20+ |
| Reporting | HTML + JUnit |
| Environment Config | dotenv |

---

## 7) Project Structure

- `tests/api` — API validations, workflow/state semantics, contract checks
- `tests/ui` — navigation, role/state sync, accessibility-focused behavior checks
- `tests/e2e` — critical cross-layer business workflows
- `api` — typed endpoint abstractions
- `pages`, `components` — UI interaction layers
- `fixtures` — reusable test context and allocator strategy
- `docs` — architecture, strategy, traceability, reports

---

## 8) Installation

### Prerequisites
- Node.js **20+**
- npm

### Setup

```bash
npm ci
npm run install:pw
```

Optional:

```bash
copy .env.example .env
```

---

## 9) Execution Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all Playwright projects |
| `npm run test:api` | Run API tests |
| `npm run test:ui` | Run UI tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run report` | Open HTML report |

Targeted examples:

```bash
npx playwright test tests/api/balance.spec.ts --project=api
npx playwright test tests/ui/navigation.spec.ts --project=ui
```

---

## 10) Test Layers

| Layer | Primary Objective | Status |
|---|---|---|
| API | Business rules, negative paths, status semantics | ✅ Implemented |
| UI | Role-driven behavior and user-visible validations | ✅ Implemented |
| E2E | Business-critical end-to-end journeys | ✅ Implemented |
| Exploratory | Edge-case and unknown behavior discovery | ✅ Implemented (documented findings) |

---

## 11) Reports Generated

- Playwright HTML: `reports/html/index.html`
- JUnit XML: `reports/junit/results.xml`
- Defects: [`docs/reports/BUGS.md`](docs/reports/BUGS.md)
- Enhancements: [`docs/reports/ENHANCEMENTS.md`](docs/reports/ENHANCEMENTS.md)
- Execution analysis: [`docs/reports/TEST_ANALYSIS_REPORT.md`](docs/reports/TEST_ANALYSIS_REPORT.md)
- Known limitations: [`docs/reports/KNOWN_LIMITATIONS.md`](docs/reports/KNOWN_LIMITATIONS.md)

---

## 12) Documentation Index

### Architecture
- [AGENT.md](docs/architecture/AGENT.md)
- [DECISION_LOG.md](docs/architecture/DECISION_LOG.md)
- [FRAMEWORK_ARCHITECTURE.md](docs/architecture/FRAMEWORK_ARCHITECTURE.md)
- [FRAMEWORK_README.md](docs/architecture/FRAMEWORK_README.md)
- [MEMORY.md](docs/architecture/MEMORY.md)
- [PROJECT_DISCOVERY.md](docs/architecture/PROJECT_DISCOVERY.md)
- [RISK_MATRIX.md](docs/architecture/RISK_MATRIX.md)

### Strategy
- [TEST_STRATEGY.md](docs/strategy/TEST_STRATEGY.md)
- [REQUIREMENT_TRACEABILITY_MATRIX.md](docs/strategy/REQUIREMENT_TRACEABILITY_MATRIX.md)
- [COVERAGE_MATRIX.md](docs/strategy/COVERAGE_MATRIX.md)

### Reports
- [BUGS.md](docs/reports/BUGS.md)
- [ENHANCEMENTS.md](docs/reports/ENHANCEMENTS.md)
- [TEST_ANALYSIS_REPORT.md](docs/reports/TEST_ANALYSIS_REPORT.md)
- [KNOWN_LIMITATIONS.md](docs/reports/KNOWN_LIMITATIONS.md)

---

## 13) Current Execution Summary

> Source of truth: manually executed results provided by the user.

| Layer | Executed | Passed | Failed | Pass Rate |
|---|---:|---:|---:|---:|
| API | 27 | 24 | 3 | 88.9% |
| UI | 7 | 7 | 0 | 100% |
| E2E | 3 | 3 | 0 | 100% |
| **Overall** | **37** | **34** | **3** | **91.9%** |

### Known bug
- **BUG-001**: Unauthorized cancellation returns **500** instead of expected **403**.
  - See: [docs/reports/BUGS.md](docs/reports/BUGS.md)

### Current limitations
- In-memory backend state (no persistence)
- No authentication/authorization framework
- Shared-state sensitivity under parallel execution (mitigations documented)
- No pagination/filtering for request lists
- No holiday-calendar-aware leave calculation

See: [docs/reports/KNOWN_LIMITATIONS.md](docs/reports/KNOWN_LIMITATIONS.md)

---

## 14) Engineering Decisions for Production-Quality Automation & Hackathon Evaluation

- API-first risk execution for high ROI and deterministic confidence
- Layered architecture (tests → fixtures → abstractions → shared utilities)
- Strict TypeScript + typed contracts to reduce drift
- Requirement/risk/coverage traceability with explicit IDs
- Accessibility-first locator policy for robust UI automation
- Parallel-safe test data strategy (worker-aware employee allocation)
- Project-scoped Playwright configuration to prevent cross-suite leakage
- Evidence-centric reporting and decision logging for reviewability

These choices support both **practical production readiness patterns** and **judge-visible engineering quality**.

---

## 15) Future Improvements

### 🟡 Planned / Recommended
1. Implement explicit authentication/authorization and align 403 semantics
2. Add persistent data storage and deterministic seeding controls
3. Add route-backed navigation and browser history coherence
4. Persist role/employee UI context across refresh
5. Add pagination/filtering/sorting for large lists
6. Expand accessibility checks toward formal WCAG targets
7. Extend business-day logic with holiday calendar support
8. Strengthen CI quality gates, trend reporting, and flake analytics

### ⚪ Out of Scope / Not Implemented (Current Hackathon Scope)
- Full security hardening model
- Persistence durability workflows
- Advanced performance/load testing
- Full WCAG compliance audit

Reference: [docs/reports/ENHANCEMENTS.md](docs/reports/ENHANCEMENTS.md)

---

## Quick Start

```bash
npm ci
npm run install:pw
npm run test:api
npm run test:ui
npm run test:e2e
npm run report
```
