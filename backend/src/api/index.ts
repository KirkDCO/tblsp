import { Router } from 'express';
import recipesRouter from './recipes.js';
import tagsRouter from './tags.js';
import importRouter from './import.js';
import uploadRouter from './upload.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/recipes', recipesRouter);
router.use('/tags', tagsRouter);
router.use('/import', importRouter);
router.use('/upload', uploadRouter);

export default router;
