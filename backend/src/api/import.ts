import { Router } from 'express';
import { ImportService } from '../services/ImportService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// POST /import - Import recipe from URL
router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      throw new AppError('URL_REQUIRED', 'URL is required', 400);
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new AppError('INVALID_URL', 'Invalid URL format', 400);
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new AppError('INVALID_URL', 'URL must use http or https protocol', 400);
    }

    const importedRecipe = await ImportService.importFromUrl(url);
    res.json(importedRecipe);
  } catch (error) {
    console.error('Import error:', error);
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      next(new AppError('IMPORT_FAILED', error.message, 500));
    } else {
      next(new AppError('IMPORT_FAILED', 'Failed to import recipe', 500));
    }
  }
});

export default router;
