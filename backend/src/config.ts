import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to backend root (accounts for dist/backend/src/ structure)
const backendRoot = join(__dirname, '..', '..', '..');

// Load .env file if it exists
function loadEnv(): void {
  const envPath = join(backendRoot, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const dataDir = process.env['DATA_DIR'] ?? join(backendRoot, 'data');

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  host: process.env['HOST'] ?? 'localhost',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databasePath: process.env['DATABASE_PATH'] ?? join(backendRoot, 'db', 'recipes.db'),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  dataDir,
  // Path to frontend build for production serving
  frontendPath: process.env['FRONTEND_PATH'] ?? join(backendRoot, '..', 'frontend', 'dist'),
} as const;

export type Config = typeof config;
