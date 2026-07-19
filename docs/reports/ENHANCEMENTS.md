# ENHANCEMENTS.md

Exploratory findings classified as product enhancements (not confirmed defects).

Status markers:
- ✅ Implemented
- 🟡 Planned / Recommended
- ⚪ Out of Scope / Not Implemented

## ENH-001 — Persist role and employee selection across browser refresh

- Status: 🟡 Planned / Recommended
- Type: UX / Session continuity
- Requirement link: REQ-017, REQ-018
- Risk link: Role switcher + employee selector behavior (RISK_MATRIX)
- Coverage link: UI-001, UI-002, EXP-TOGGLE
- Priority: Medium
- Effort: Low–Medium

### Problem
Refresh resets role/employee context to defaults, interrupting workflow continuity.

### Recommendation
Persist role, employee, and active section state in local storage with safe fallback handling.

### Value
Improves user continuity and demo polish with low-to-moderate engineering effort.

---

## ENH-002 — Add URL-backed routing for navigation and browser history coherence

- Status: 🟡 Planned / Recommended
- Type: UX / Navigation architecture
- Requirement link: REQ-017
- Risk link: Role switch consistency and context continuity
- Coverage link: UI-001, EXP-TOGGLE
- Priority: Medium
- Effort: Medium

### Problem
Navigation is in-memory only; browser back/forward is not section-aware.

### Recommendation
Introduce route-backed sections and sync role/section state with URL transitions.

### Value
Improves recoverability, deep-linking, and production-style navigation behavior.

---

## ⚪ Out of Scope (Current Hackathon Window)
- Implementing both enhancements within the current execution cycle.
- Full UX architecture rework beyond traceable recommendations.
