# Implementation Plan: Recipe Manager

**Branch**: `001-recipe-manager` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-recipe-manager/spec.md`

## Summary

Build a recipe manager web application with a two-pane interface for browsing, searching, and organizing recipes. The system uses a client-server architecture with a React/TypeScript frontend and a Node.js backend with SQLite storage. Key features include full-text search, tag-based filtering, star ratings, manual recipe entry, and web URL import with server-side content extraction.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend and backend)
**Primary Dependencies**: React 18+ (frontend), Express.js (backend), SQLite3 (database)
**Storage**: SQLite database on backend server
**Testing**: Vitest (unit/integration), Playwright (e2e)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge); Node.js 20+ server on local network
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Search results in <100ms for 1000+ recipes; page load <2s
**Constraints**: Single-user (no auth required); local network deployment; SQLite file-based storage
**Scale/Scope**: Personal use; 100-1000 recipes; single concurrent user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Component-Based Architecture | PASS | React frontend with reusable components; TypeScript props interfaces |
| II. Type Safety First | PASS | TypeScript strict mode; shared types between frontend/backend |
| III. API Contract Discipline | PASS | REST API with OpenAPI spec; structured error responses |
| IV. Test Coverage Expectations | PASS | Unit tests for components; integration tests for API; e2e for critical flows |
| V. Simplicity and YAGNI | PASS | Focused feature set; SQLite over complex DB; no premature abstractions |
| Security: Input Validation | PASS | Server-side validation for all inputs; URL sanitization for web import |
| Security: Data Exposure | PASS | API returns only requested recipe data; no sensitive data in system |

**Gate Status**: PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-manager/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLite models (Recipe, Tag, Ingredient)
│   ├── services/        # Business logic (RecipeService, TagService, ImportService)
│   ├── api/             # Express routes and controllers
│   └── utils/           # Shared utilities (web scraper, tag suggester)
├── db/
│   └── seeds/           # Sample recipes for initial setup
└── tests/
    ├── integration/     # API endpoint tests
    └── unit/            # Service/utility tests

frontend/
├── src/
│   ├── components/      # React components (RecipeList, RecipeView, SearchPane, etc.)
│   ├── pages/           # Page-level components (MainLayout)
│   ├── services/        # API client layer
│   ├── hooks/           # Custom React hooks
│   └── types/           # Shared TypeScript interfaces
└── tests/
    ├── components/      # Component unit tests
    └── e2e/             # Playwright end-to-end tests

shared/
└── types/               # TypeScript types shared between frontend/backend
```

**Structure Decision**: Web application structure with separate frontend and backend directories. Shared types directory for TypeScript interfaces used by both. SQLite database file stored in backend/db/.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
