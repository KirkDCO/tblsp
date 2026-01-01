# Tasks: Recipe Manager

**Input**: Design documents from `/specs/001-recipe-manager/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Shared types**: `shared/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per plan.md (backend/, frontend/, shared/)
- [x] T002 Initialize backend Node.js project with TypeScript in backend/package.json
- [x] T003 [P] Initialize frontend Vite/React project with TypeScript in frontend/package.json
- [x] T004 [P] Initialize shared types package in shared/package.json
- [x] T005 Install backend dependencies (express, better-sqlite3, cheerio, cors, helmet, zod) in backend/
- [x] T006 [P] Install frontend dependencies (react, react-dom, @tanstack/react-query, zod) in frontend/
- [x] T007 [P] Configure TypeScript strict mode in backend/tsconfig.json
- [x] T008 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T009 [P] Configure ESLint and Prettier in backend/.eslintrc.js
- [ ] T010 [P] Configure ESLint and Prettier in frontend/.eslintrc.js
- [x] T011 Create environment configuration in backend/.env.example and backend/src/config.ts
- [x] T012 [P] Create environment configuration in frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create SQLite database schema file in backend/db/schema.sql (from data-model.md)
- [x] T014 Create database initialization script in backend/src/db/init.ts
- [x] T015 Create database connection module in backend/src/db/connection.ts
- [x] T016 [P] Create shared TypeScript types in shared/types/recipe.ts (Recipe, RecipeInput, RecipeDetail)
- [x] T017 [P] Create shared TypeScript types in shared/types/tag.ts (Tag, TagWithCount)
- [x] T018 [P] Create shared TypeScript types in shared/types/ingredient.ts (Ingredient)
- [x] T019 [P] Create shared TypeScript types in shared/types/api.ts (Error, RecipeListResponse)
- [x] T020 Setup Express server with middleware (cors, helmet, json) in backend/src/app.ts
- [x] T021 Create structured error handler in backend/src/middleware/errorHandler.ts
- [x] T022 Create API router entry point in backend/src/api/index.ts
- [x] T023 Create server entry point in backend/src/index.ts
- [x] T024 [P] Setup React Query provider in frontend/src/providers/QueryProvider.tsx
- [x] T025 [P] Create API client base in frontend/src/services/api.ts
- [x] T026 Create main two-pane layout component in frontend/src/pages/MainLayout.tsx
- [x] T027 Create App component with providers in frontend/src/App.tsx
- [x] T028 Update frontend entry point in frontend/src/main.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse and Search Recipes (Priority: P1) 🎯 MVP

**Goal**: Display recipes in a two-pane interface with full-text search, ingredient search, and tag filtering

**Independent Test**: Load sample recipes and verify search/filter returns correct results

### Implementation for User Story 1

- [x] T029 [P] [US1] Create Recipe model with CRUD operations in backend/src/models/Recipe.ts
- [x] T030 [P] [US1] Create Ingredient model with parsing logic in backend/src/models/Ingredient.ts
- [x] T031 [P] [US1] Create Tag model (read-only for US1) in backend/src/models/Tag.ts
- [x] T032 [US1] Create RecipeService with search/filter logic in backend/src/services/RecipeService.ts
- [x] T033 [US1] Implement GET /recipes endpoint with search params in backend/src/api/recipes.ts
- [x] T034 [US1] Implement GET /recipes/:id endpoint in backend/src/api/recipes.ts
- [x] T035 [US1] Implement GET /tags endpoint (list all tags) in backend/src/api/tags.ts
- [x] T036 [US1] Create sample recipe seed data in backend/db/seeds/recipes.ts
- [x] T037 [US1] Create seed runner script in backend/src/db/seed.ts
- [x] T038 [P] [US1] Create useRecipes hook in frontend/src/hooks/useRecipes.ts
- [x] T039 [P] [US1] Create useRecipe hook (single recipe) in frontend/src/hooks/useRecipe.ts
- [x] T040 [P] [US1] Create useTags hook in frontend/src/hooks/useTags.ts
- [x] T041 [P] [US1] Create RecipeListItem component in frontend/src/components/RecipeListItem.tsx
- [x] T042 [P] [US1] Create RecipeList component in frontend/src/components/RecipeList.tsx
- [x] T043 [P] [US1] Create RecipeView component in frontend/src/components/RecipeView.tsx
- [x] T044 [P] [US1] Create SearchBox component in frontend/src/components/SearchBox.tsx
- [x] T045 [P] [US1] Create TagFilter component in frontend/src/components/TagFilter.tsx
- [x] T046 [P] [US1] Create SortControls component in frontend/src/components/SortControls.tsx
- [x] T047 [US1] Create SearchPane component (combines search, tags, sort) in frontend/src/components/SearchPane.tsx
- [x] T048 [US1] Integrate SearchPane and RecipeView into MainLayout in frontend/src/pages/MainLayout.tsx
- [x] T049 [US1] Add loading and error states to recipe components
- [x] T050 [US1] Add "no results" empty state to RecipeList in frontend/src/components/RecipeList.tsx

**Checkpoint**: User Story 1 complete - can browse, search, and filter recipes

---

## Phase 4: User Story 2 - Add Recipes Manually (Priority: P2)

**Goal**: Create, edit, and delete recipes through a form interface

**Independent Test**: Create a new recipe, verify it appears in list, edit it, verify changes, soft-delete it

### Implementation for User Story 2

- [x] T051 [US2] Add create/update/delete methods to RecipeService in backend/src/services/RecipeService.ts
- [x] T052 [US2] Implement POST /recipes endpoint in backend/src/api/recipes.ts
- [x] T053 [US2] Implement PUT /recipes/:id endpoint in backend/src/api/recipes.ts
- [x] T054 [US2] Implement DELETE /recipes/:id (soft-delete) in backend/src/api/recipes.ts
- [x] T055 [US2] Implement POST /recipes/:id/restore endpoint in backend/src/api/recipes.ts
- [x] T056 [US2] Implement GET /recipes/trash endpoint in backend/src/api/recipes.ts
- [x] T057 [US2] Implement POST /recipes/trash/purge endpoint in backend/src/api/recipes.ts
- [ ] T058 [US2] Add recipe validation with Zod in backend/src/validators/recipeValidator.ts
- [x] T059 [P] [US2] Create useCreateRecipe mutation hook in frontend/src/hooks/useCreateRecipe.ts
- [x] T060 [P] [US2] Create useUpdateRecipe mutation hook in frontend/src/hooks/useUpdateRecipe.ts
- [x] T061 [P] [US2] Create useDeleteRecipe mutation hook in frontend/src/hooks/useDeleteRecipe.ts
- [x] T062 [P] [US2] Create useRestoreRecipe mutation hook in frontend/src/hooks/useRestoreRecipe.ts
- [x] T063 [US2] Create RecipeForm component in frontend/src/components/RecipeForm.tsx
- [x] T064 [US2] Create AddRecipeButton component in frontend/src/components/AddRecipeButton.tsx
- [x] T065 [US2] Create EditRecipeButton component in frontend/src/components/EditRecipeButton.tsx
- [x] T066 [US2] Create DeleteRecipeButton component in frontend/src/components/DeleteRecipeButton.tsx
- [ ] T067 [US2] Create TrashView component in frontend/src/components/TrashView.tsx
- [x] T068 [US2] Integrate add/edit/delete into RecipeView in frontend/src/components/RecipeView.tsx
- [x] T069 [US2] Add form validation feedback to RecipeForm in frontend/src/components/RecipeForm.tsx

**Checkpoint**: User Story 2 complete - can add, edit, and delete recipes

---

## Phase 5: User Story 3 - Import Recipes from Web (Priority: P3)

**Goal**: Import recipes by URL with server-side extraction

**Independent Test**: Provide recipe URL, verify extracted content is accurate and editable

### Implementation for User Story 3

- [x] T070 [US3] Create web scraper utility in backend/src/utils/recipeScraper.ts
- [x] T071 [US3] Add JSON-LD schema.org/Recipe parser to scraper in backend/src/utils/recipeScraper.ts
- [x] T072 [US3] Add fallback heuristic extraction to scraper in backend/src/utils/recipeScraper.ts
- [x] T073 [US3] Create ImportService in backend/src/services/ImportService.ts
- [x] T074 [US3] Implement POST /import endpoint in backend/src/api/import.ts
- [x] T075 [US3] Add URL validation to import endpoint in backend/src/validators/importValidator.ts
- [x] T076 [P] [US3] Create useImportRecipe mutation hook in frontend/src/hooks/useImportRecipe.ts
- [x] T077 [US3] Create ImportDialog component in frontend/src/components/ImportDialog.tsx
- [x] T078 [US3] Create ImportPreview component (shows extracted content) in frontend/src/components/ImportPreview.tsx
- [x] T079 [US3] Add import button to AddRecipeButton in frontend/src/components/AddRecipeButton.tsx
- [x] T080 [US3] Display source URL link in RecipeView in frontend/src/components/RecipeView.tsx
- [x] T081 [US3] Add import error handling and fallback to manual entry in frontend/src/components/ImportDialog.tsx

**Checkpoint**: User Story 3 complete - can import recipes from URLs

---

## Phase 6: User Story 4 - Tag and Rate Recipes (Priority: P4)

**Goal**: Add tags and ratings to recipes, manage tags globally

**Independent Test**: Add tags and rating to recipe, verify filtering by tag and sorting by rating works

### Implementation for User Story 4

- [x] T082 [US4] Add create/update/delete methods to Tag model in backend/src/models/Tag.ts
- [x] T083 [US4] Create TagService in backend/src/services/TagService.ts
- [x] T084 [US4] Implement POST /tags endpoint in backend/src/api/tags.ts
- [x] T085 [US4] Implement PUT /tags/:id endpoint in backend/src/api/tags.ts
- [x] T086 [US4] Implement DELETE /tags/:id endpoint in backend/src/api/tags.ts
- [x] T087 [US4] Implement PUT /recipes/:id/rating endpoint in backend/src/api/recipes.ts
- [x] T088 [US4] Implement DELETE /recipes/:id/rating endpoint in backend/src/api/recipes.ts
- [x] T089 [US4] Implement PUT /recipes/:id/tags endpoint in backend/src/api/recipes.ts
- [x] T090 [US4] Implement POST /recipes/:id/tags endpoint in backend/src/api/recipes.ts
- [x] T091 [P] [US4] Create useSetRating mutation hook in frontend/src/hooks/useSetRating.ts
- [x] T092 [P] [US4] Create useSetTags mutation hook in frontend/src/hooks/useSetTags.ts
- [ ] T093 [P] [US4] Create useCreateTag mutation hook in frontend/src/hooks/useCreateTag.ts
- [ ] T094 [P] [US4] Create useUpdateTag mutation hook in frontend/src/hooks/useUpdateTag.ts
- [ ] T095 [P] [US4] Create useDeleteTag mutation hook in frontend/src/hooks/useDeleteTag.ts
- [x] T096 [US4] Create RatingStars component in frontend/src/components/RatingStars.tsx
- [x] T097 [US4] Create TagPicker component (add/remove tags) in frontend/src/components/TagPicker.tsx
- [ ] T098 [US4] Create TagManager component (rename/delete tags) in frontend/src/components/TagManager.tsx
- [x] T099 [US4] Integrate RatingStars into RecipeView in frontend/src/components/RecipeView.tsx
- [x] T100 [US4] Integrate TagPicker into RecipeView in frontend/src/components/RecipeView.tsx
- [x] T101 [US4] Add rating sort option to SortControls in frontend/src/components/SortControls.tsx

**Checkpoint**: User Story 4 complete - can rate and tag recipes

---

## Phase 7: User Story 5 - Auto-Suggested Tags (Priority: P5)

**Goal**: Suggest relevant tags based on recipe content

**Independent Test**: Add recipe with obvious ingredients, verify relevant tags are suggested

### Implementation for User Story 5

- [x] T102 [US5] Create tag keyword mappings in backend/src/utils/tagMappings.ts
- [x] T103 [US5] Create TagSuggester utility in backend/src/utils/tagSuggester.ts
- [x] T104 [US5] Implement POST /suggest-tags endpoint in backend/src/api/tags.ts
- [x] T105 [P] [US5] Create useSuggestTags mutation hook in frontend/src/hooks/useSuggestTags.ts
- [x] T106 [US5] Create SuggestedTags component in frontend/src/components/SuggestedTags.tsx
- [x] T107 [US5] Integrate SuggestedTags into RecipeForm in frontend/src/components/RecipeForm.tsx
- [x] T108 [US5] Integrate SuggestedTags into ImportPreview in frontend/src/components/ImportPreview.tsx

**Checkpoint**: User Story 5 complete - auto-tag suggestions available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T109 Add connection error handling component in frontend/src/components/ConnectionError.tsx
- [ ] T110 Add loading spinner component in frontend/src/components/LoadingSpinner.tsx
- [ ] T111 [P] Add keyboard shortcuts for common actions in frontend/src/hooks/useKeyboardShortcuts.ts
- [ ] T112 [P] Add responsive styles for mobile viewing in frontend/src/styles/responsive.css
- [ ] T113 Review and improve error messages across all API endpoints
- [ ] T114 Run quickstart.md validation steps to verify setup works
- [ ] T115 [P] Add npm scripts for dev, build, and db commands in package.json files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel if staffed
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Builds on US1 components but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Uses RecipeForm from US2 but can create own
- **User Story 4 (P4)**: Can start after Foundational - Uses Tag model created in US1
- **User Story 5 (P5)**: Depends on US4 (Tag system) - Integrates with RecipeForm from US2

### Within Each User Story

- Models before services
- Services before API endpoints
- Backend before frontend (for API contracts)
- Hooks before components
- Individual components before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- All shared types (T016-T019) can be created in parallel
- All frontend hooks within a story marked [P] can run in parallel
- All frontend components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all models in parallel:
Task: "Create Recipe model in backend/src/models/Recipe.ts"
Task: "Create Ingredient model in backend/src/models/Ingredient.ts"
Task: "Create Tag model in backend/src/models/Tag.ts"

# Launch all frontend hooks in parallel:
Task: "Create useRecipes hook in frontend/src/hooks/useRecipes.ts"
Task: "Create useRecipe hook in frontend/src/hooks/useRecipe.ts"
Task: "Create useTags hook in frontend/src/hooks/useTags.ts"

# Launch all simple components in parallel:
Task: "Create RecipeListItem component in frontend/src/components/RecipeListItem.tsx"
Task: "Create SearchBox component in frontend/src/components/SearchBox.tsx"
Task: "Create TagFilter component in frontend/src/components/TagFilter.tsx"
Task: "Create SortControls component in frontend/src/components/SortControls.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Browse and Search)
4. **STOP and VALIDATE**: Load sample recipes, test search and filtering
5. Deploy/demo if ready - users can browse existing recipes

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test: search, browse, filter → MVP!
3. Add User Story 2 → Test: create, edit, delete → Full CRUD
4. Add User Story 3 → Test: import from URL → Web import
5. Add User Story 4 → Test: tag, rate, sort → Organization
6. Add User Story 5 → Test: auto-suggestions → Polish
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (after A or in parallel)
   - Developer C: User Story 3 (after B or in parallel)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to repository root
