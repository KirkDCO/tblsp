# Quickstart: Recipe Manager

**Feature**: 001-recipe-manager
**Date**: 2025-12-25

This guide helps you get the Recipe Manager running locally for development.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or pnpm 8+
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Project Setup

### 1. Clone and Install

```bash
# Navigate to project root
cd tblsp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install shared types (if using workspace)
cd ../shared
npm install
```

### 2. Initialize Database

```bash
cd backend

# Create SQLite database with schema
npm run db:init

# Seed sample recipes (optional but recommended)
npm run db:seed
```

This creates `backend/db/recipes.db` with:
- Tables: `recipe`, `tag`, `recipe_tag`, `ingredient`
- FTS5 indexes for full-text search
- 5-10 sample recipes with tags

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Starts Express server on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### 4. Open the App

Navigate to http://localhost:5173 in your browser.

You should see:
- Two-pane layout with recipe list on left
- Sample recipes loaded and searchable
- Recipe details displayed on right when selected

## Development Commands

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run test` | Run unit and integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:init` | Create database schema |
| `npm run db:seed` | Load sample recipes |
| `npm run db:reset` | Drop and recreate database |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run component tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./db/recipes.db

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# API endpoint
VITE_API_URL=http://localhost:3001/api
```

## Project Structure

```
tblsp/
├── backend/
│   ├── src/
│   │   ├── api/           # Express routes
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helpers (scraper, tagger)
│   ├── db/
│   │   ├── recipes.db     # SQLite database (gitignored)
│   │   └── seeds/         # Sample data
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page layouts
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript interfaces
│   └── tests/
│
└── shared/
    └── types/             # Shared TypeScript types
```

## Testing

### Run All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend component tests
cd frontend && npm test

# End-to-end tests (requires both servers running)
cd frontend && npm run test:e2e
```

### Test a Specific Feature

```bash
# Backend: Test recipe API
npm test -- --grep "recipe"

# Frontend: Test search component
npm test -- RecipeSearch
```

## Common Tasks

### Add a New Recipe (via API)

```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "ingredientsRaw": "1 cup flour\n2 eggs",
    "instructions": "Mix and bake."
  }'
```

### Import from URL (via API)

```bash
curl -X POST http://localhost:3001/api/import \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/recipe"}'
```

### Search Recipes (via API)

```bash
# Full-text search
curl "http://localhost:3001/api/recipes?search=chicken"

# Filter by tag
curl "http://localhost:3001/api/recipes?tags=1,2"

# Search ingredients
curl "http://localhost:3001/api/recipes?ingredient=garlic"
```

## Troubleshooting

### Database Errors

```bash
# Reset database completely
cd backend
rm db/recipes.db
npm run db:init
npm run db:seed
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `curl http://localhost:3001/api/recipes`
2. Check CORS_ORIGIN in backend `.env` matches frontend URL
3. Check VITE_API_URL in frontend `.env` matches backend URL

## Next Steps

After setup, you can:

1. Browse sample recipes and test search
2. Add a new recipe manually
3. Try importing a recipe from a URL
4. Add tags and ratings to recipes
5. Review the API contract at `specs/001-recipe-manager/contracts/openapi.yaml`
