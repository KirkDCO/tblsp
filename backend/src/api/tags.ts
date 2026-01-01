import { Router } from 'express';
import { TagModel } from '../models/Tag.js';
import { AppError } from '../middleware/errorHandler.js';
import { suggestTags } from '../utils/tagSuggester.js';

const router = Router();

// GET /tags - List all tags with recipe counts
router.get('/', (_req, res) => {
  const tags = TagModel.findAllWithCounts();
  res.json({ tags });
});

// GET /tags/:id - Get single tag
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid tag ID', 400);
  }

  const tag = TagModel.findById(id);

  if (!tag) {
    throw new AppError('TAG_NOT_FOUND', 'Tag not found', 404);
  }

  res.json(tag);
});

// POST /tags - Create tag
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('TAG_NAME_REQUIRED', 'Tag name is required', 400);
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 50) {
    throw new AppError('TAG_NAME_TOO_LONG', 'Tag name must be 50 characters or less', 400);
  }

  // Check for existing tag (case-insensitive)
  const existing = TagModel.findByName(trimmedName);
  if (existing) {
    throw new AppError('TAG_ALREADY_EXISTS', 'A tag with this name already exists', 409);
  }

  const tag = TagModel.create(trimmedName);
  res.status(201).json(tag);
});

// PUT /tags/:id - Update tag
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid tag ID', 400);
  }

  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('TAG_NAME_REQUIRED', 'Tag name is required', 400);
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 50) {
    throw new AppError('TAG_NAME_TOO_LONG', 'Tag name must be 50 characters or less', 400);
  }

  // Check for existing tag with same name (case-insensitive), excluding current
  const existing = TagModel.findByName(trimmedName);
  if (existing && existing.id !== id) {
    throw new AppError('TAG_ALREADY_EXISTS', 'A tag with this name already exists', 409);
  }

  const tag = TagModel.update(id, trimmedName);

  if (!tag) {
    throw new AppError('TAG_NOT_FOUND', 'Tag not found', 404);
  }

  res.json(tag);
});

// DELETE /tags/:id - Delete tag
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new AppError('INVALID_ID', 'Invalid tag ID', 400);
  }

  const success = TagModel.delete(id);

  if (!success) {
    throw new AppError('TAG_NOT_FOUND', 'Tag not found', 404);
  }

  res.status(204).send();
});

// POST /suggest-tags - Suggest tags based on recipe content
router.post('/suggest', (req, res) => {
  const { title, ingredientsRaw, instructions } = req.body;

  if (!title || typeof title !== 'string') {
    throw new AppError('TITLE_REQUIRED', 'Title is required for tag suggestions', 400);
  }

  const suggestions = suggestTags(
    title,
    ingredientsRaw || '',
    instructions || ''
  );

  res.json({ suggestions });
});

export default router;
