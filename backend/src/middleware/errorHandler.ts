import type { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../../../shared/types/api.js';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    const errorResponse: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle validation errors from Zod
  if (err.name === 'ZodError') {
    const errorResponse: ApiError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { issues: (err as unknown as { issues: unknown[] }).issues },
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Generic error
  const errorResponse: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  res.status(500).json(errorResponse);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const errorResponse: ApiError = {
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  };
  res.status(404).json(errorResponse);
}
