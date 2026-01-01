# Research: Recipe Manager

**Feature**: 001-recipe-manager
**Date**: 2025-12-25

## Technology Decisions

### Frontend Framework

**Decision**: React 18+ with TypeScript

**Rationale**:
- Constitution mandates React component-based architecture
- TypeScript required by constitution for type safety
- React 18 provides concurrent rendering for smooth UI updates during search
- Excellent ecosystem for two-pane layouts (e.g., react-split-pane or CSS Grid)

**Alternatives Considered**:
- Vue.js: Good option but constitution specifies React
- Svelte: Lighter weight but smaller ecosystem for complex layouts

### Backend Framework

**Decision**: Express.js with TypeScript

**Rationale**:
- Lightweight and minimal, aligns with YAGNI principle
- Native TypeScript support with ts-node or tsx
- Simple REST API routing
- Large ecosystem for middleware (CORS, body parsing, error handling)

**Alternatives Considered**:
- Fastify: Faster but more complex setup for simple use case
- NestJS: Too heavyweight for single-user personal app
- Hono: Modern but less mature ecosystem

### Database

**Decision**: SQLite with better-sqlite3

**Rationale**:
- Specified in clarifications as lightweight requirement
- File-based, no separate database server needed
- better-sqlite3 provides synchronous API (simpler code, no async overhead for single-user)
- Full-text search via FTS5 extension for recipe content search
- Single file makes backup trivial

**Alternatives Considered**:
- PostgreSQL: Overkill for single-user local app
- LevelDB: No SQL, harder to query complex relationships
- Drizzle ORM: Could add later if needed, but raw better-sqlite3 is simpler

### Web Scraping / Recipe Extraction

**Decision**: Cheerio + recipe-scrapers patterns

**Rationale**:
- Server-side extraction avoids CORS issues
- Cheerio provides jQuery-like DOM parsing for Node.js
- Many recipe sites use JSON-LD schema.org/Recipe markup
- Fallback to heuristic extraction for sites without structured data

**Alternatives Considered**:
- Puppeteer: Heavyweight, requires headless browser
- JSDOM: Slower than Cheerio for parsing
- External API services: Adds dependency and potential cost

### Auto-Tagging / Tag Suggestions

**Decision**: Keyword-based matching with curated ingredient-to-tag mappings

**Rationale**:
- Simple, predictable, no ML dependencies
- Curated mappings for cuisines (pasta→Italian, soy sauce→Asian, etc.)
- Dietary detection via ingredient keywords (no meat→Vegetarian candidate)
- Aligns with YAGNI - works well enough without complexity

**Alternatives Considered**:
- OpenAI API: Adds external dependency and cost
- Local ML model: Complex setup for marginal benefit
- No auto-tagging: Would reduce user convenience per spec requirements

### Testing Strategy

**Decision**: Vitest (unit/integration) + Playwright (e2e)

**Rationale**:
- Vitest: Fast, TypeScript-native, compatible with Vite build
- Playwright: Cross-browser e2e testing, good for verifying two-pane interactions
- Constitution requires tests to accompany features

**Alternatives Considered**:
- Jest: Slower than Vitest, more configuration needed
- Cypress: Good but Playwright has better multi-browser support

### State Management (Frontend)

**Decision**: React Query (TanStack Query) for server state

**Rationale**:
- Recipes are server-side data, not client state
- Built-in caching, refetching, optimistic updates
- Eliminates need for Redux or other global state libraries
- Aligns with simplicity principle

**Alternatives Considered**:
- Redux: Overkill for server-state-only app
- Zustand: Good but React Query handles the actual use case better
- SWR: Similar to React Query, either would work

### Build Tooling

**Decision**: Vite (frontend), tsx (backend development), esbuild (backend production)

**Rationale**:
- Vite: Fast HMR, native TypeScript, modern defaults
- tsx: Simple TypeScript execution for development
- esbuild: Fast bundling for production backend

**Alternatives Considered**:
- Webpack: Slower, more configuration
- Create React App: Deprecated, less flexible

## Implementation Patterns

### Full-Text Search

SQLite FTS5 virtual table for recipe content search:
- Index title, ingredients, instructions
- Support prefix matching for type-ahead
- Rank results by relevance

### Soft Delete

Recipes have `deleted_at` timestamp:
- NULL = active
- Non-NULL = in trash
- Scheduled job or on-demand purge for >30 days old

### Two-Pane Layout

CSS Grid or Flexbox with resizable divider:
- Left pane: Fixed or resizable width, scrollable recipe list
- Right pane: Full recipe content, scrollable independently

### API Error Handling

Structured JSON error responses:
```json
{
  "error": {
    "code": "RECIPE_NOT_FOUND",
    "message": "Recipe with ID 123 not found",
    "details": {}
  }
}
```

## Open Questions Resolved

All technical decisions have been made. No NEEDS CLARIFICATION items remain.

## Dependencies Summary

### Frontend
- react, react-dom (^18.x)
- @tanstack/react-query (^5.x)
- typescript (^5.x)
- vite (^5.x)

### Backend
- express (^4.x)
- better-sqlite3 (^9.x)
- cheerio (^1.x)
- cors, helmet (security middleware)
- typescript, tsx (development)

### Testing
- vitest (^1.x)
- @playwright/test (^1.x)
- @testing-library/react (^14.x)

### Shared
- zod (schema validation, shared between frontend/backend)
