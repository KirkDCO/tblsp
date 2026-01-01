import { Router } from 'express';
import { RecipeService } from '../services/RecipeService.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RecipeSearchParams } from '../../../shared/types/api.js';

const router = Router();

// GET /recipes - List and search recipes
router.get('/', (req, res) => {
  const params: RecipeSearchParams = {
    search: req.query.search as string | undefined,
    tags: req.query.tags as string | undefined,
    ingredient: req.query.ingredient as string | undefined,
    sort: req.query.sort as RecipeSearchParams['sort'],
    order: req.query.order as RecipeSearchParams['order'],
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
  };

  const result = RecipeService.search(params);
  res.json(result);
});

// GET /recipes/trash - List trashed recipes
router.get('/trash', (_req, res) => {
  const recipes = RecipeService.getTrashed();
  res.json({ recipes });
});

// GET /recipes/:id - Get single recipe
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const recipe = RecipeService.getById(id);

  if (!recipe) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.json(recipe);
});

// POST /recipes - Create recipe
router.post('/', (req, res) => {
  const { title, ingredientsRaw, instructions, notes, sourceUrl, imageUrl, tagIds } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new AppError('RECIPE_TITLE_REQUIRED', 'Recipe title is required', 400);
  }

  if (!ingredientsRaw || typeof ingredientsRaw !== 'string' || !ingredientsRaw.trim()) {
    throw new AppError('RECIPE_INGREDIENTS_REQUIRED', 'Recipe ingredients are required', 400);
  }

  if (!instructions || typeof instructions !== 'string' || !instructions.trim()) {
    throw new AppError('RECIPE_INSTRUCTIONS_REQUIRED', 'Recipe instructions are required', 400);
  }

  const recipe = RecipeService.create({
    title: title.trim(),
    ingredientsRaw: ingredientsRaw.trim(),
    instructions: instructions.trim(),
    notes: notes?.trim() || null,
    sourceUrl: sourceUrl?.trim() || null,
    imageUrl: imageUrl?.trim() || null,
    tagIds: Array.isArray(tagIds) ? tagIds : undefined,
  });

  res.status(201).json(recipe);
});

// PUT /recipes/:id - Update recipe
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const { title, ingredientsRaw, instructions, notes, sourceUrl, imageUrl, tagIds } = req.body;

  const updates: Record<string, unknown> = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      throw new AppError('RECIPE_TITLE_REQUIRED', 'Recipe title cannot be empty', 400);
    }
    updates.title = title.trim();
  }

  if (ingredientsRaw !== undefined) {
    if (typeof ingredientsRaw !== 'string' || !ingredientsRaw.trim()) {
      throw new AppError('RECIPE_INGREDIENTS_REQUIRED', 'Recipe ingredients cannot be empty', 400);
    }
    updates.ingredientsRaw = ingredientsRaw.trim();
  }

  if (instructions !== undefined) {
    if (typeof instructions !== 'string' || !instructions.trim()) {
      throw new AppError('RECIPE_INSTRUCTIONS_REQUIRED', 'Recipe instructions cannot be empty', 400);
    }
    updates.instructions = instructions.trim();
  }

  if (notes !== undefined) {
    updates.notes = notes?.trim() || null;
  }

  if (sourceUrl !== undefined) {
    updates.sourceUrl = sourceUrl?.trim() || null;
  }

  if (imageUrl !== undefined) {
    updates.imageUrl = imageUrl?.trim() || null;
  }

  if (Array.isArray(tagIds)) {
    updates.tagIds = tagIds;
  }

  const recipe = RecipeService.update(id, updates);

  if (!recipe) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.json(recipe);
});

// DELETE /recipes/:id - Soft delete recipe
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const success = RecipeService.softDelete(id);

  if (!success) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.status(204).send();
});

// POST /recipes/:id/restore - Restore trashed recipe
router.post('/:id/restore', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const recipe = RecipeService.restore(id);

  if (!recipe) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found in trash', 404);
  }

  res.json(recipe);
});

// POST /recipes/trash/purge - Permanently delete old trashed recipes
router.post('/trash/purge', (_req, res) => {
  const purgedCount = RecipeService.purgeOld(30);
  res.json({ purgedCount });
});

// PUT /recipes/:id/rating - Set recipe rating
router.put('/:id/rating', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const { rating } = req.body;

  if (rating !== null && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
    throw new AppError('RECIPE_INVALID_RATING', 'Rating must be a number between 1 and 5', 400);
  }

  const success = RecipeService.setRating(id, rating);

  if (!success) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.json({ success: true });
});

// DELETE /recipes/:id/rating - Remove recipe rating
router.delete('/:id/rating', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const success = RecipeService.setRating(id, null);

  if (!success) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.status(204).send();
});

// PUT /recipes/:id/tags - Set recipe tags
router.put('/:id/tags', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid recipe ID', 400);
  }

  const { tagIds } = req.body;

  if (!Array.isArray(tagIds) || !tagIds.every((id) => typeof id === 'number')) {
    throw new AppError('INVALID_TAGS', 'tagIds must be an array of numbers', 400);
  }

  const recipe = RecipeService.update(id, { tagIds });

  if (!recipe) {
    throw new AppError('RECIPE_NOT_FOUND', 'Recipe not found', 404);
  }

  res.json(recipe);
});

export default router;
