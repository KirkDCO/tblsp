# tblsp

A full-stack recipe manager application for storing, searching, organizing, and managing your recipe collection.

## Features

- **Browse and Search** - Two-pane interface with full-text search across titles, ingredients, and instructions
- **Manual Recipe Entry** - Create recipes by typing content directly
- **Web Import** - Paste URLs to scrape and import recipes from websites
- **Tagging System** - Organize recipes with custom tags
- **Auto-Tag Suggestions** - System analyzes recipe content to suggest relevant tags
- **Ratings** - Rate recipes from 1-5 stars
- **Ingredient Search** - Filter recipes by specific ingredients
- **Sorting** - Sort by rating, date added, or alphabetically
- **Soft Delete** - Recover deleted recipes within a 30-day window

## Tech Stack

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js 4.21
- **Language**: TypeScript 5.6
- **Database**: SQLite3 with better-sqlite3
- **Validation**: Zod
- **Web Scraping**: Cheerio

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 5.4
- **State Management**: TanStack React Query 5.59

### Testing
- **Unit/Component**: Vitest
- **React Testing**: @testing-library/react
- **E2E**: Playwright

## Project Structure

```
tblsp/
├── backend/
│   ├── src/
│   │   ├── api/           # Express route handlers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities (scraping, tagging)
│   │   ├── middleware/    # Express middleware
│   │   └── db/            # Database connection and init
│   ├── db/
│   │   └── schema.sql     # Database schema
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page layouts
│   │   ├── providers/     # Context providers
│   │   └── services/      # API client
│   └── tests/
├── shared/
│   └── types/             # Shared TypeScript interfaces
└── specs/                 # Feature specifications
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install shared type dependencies
cd ../shared && npm install
```

### Database Setup

```bash
cd backend

# Initialize the database schema
npm run db:init

# (Optional) Load sample recipes
npm run db:seed

# To reset the database completely
npm run db:reset
```

### Environment Variables

Create `.env` files from the examples:

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./db/recipes.db
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

## Running the Application

Start both servers in separate terminals:

```bash
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

Access the application at: `http://localhost:5173`

## Available Commands

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled JavaScript |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:init` | Initialize database schema |
| `npm run db:seed` | Populate sample recipes |
| `npm run db:reset` | Drop and recreate database |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run component tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recipes` | List all recipes (supports search, filtering, sorting) |
| `POST` | `/api/recipes` | Create a new recipe |
| `GET` | `/api/recipes/:id` | Get a specific recipe |
| `PUT` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Soft delete a recipe |
| `GET` | `/api/tags` | List all tags |
| `POST` | `/api/tags` | Create a new tag |
| `POST` | `/api/import` | Import recipe from URL |
| `POST` | `/api/upload` | Upload recipe files |

## Database Schema

The application uses SQLite with the following core tables:

- **recipe** - Main recipe storage with full-text search (FTS5)
- **tag** - Recipe categories and labels
- **recipe_tag** - Many-to-many relationship between recipes and tags
- **ingredient** - Parsed ingredients for ingredient-specific search

## Testing

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Run E2E tests
cd frontend && npm run test:e2e

# Run tests in watch mode (either directory)
npm run test:watch
```

## Building for Production

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

The backend compiles to `backend/dist/` and the frontend builds to `frontend/dist/`.

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2026 Robert Kirk DeLisle
