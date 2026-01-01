import { getDatabase, closeDatabase } from './connection.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function initializeDatabase(): void {
  const db = getDatabase();

  // Read and execute the schema file
  const schemaPath = join(__dirname, '..', '..', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema statements
  db.exec(schema);

  // Run migrations for existing databases
  runMigrations(db);

  console.log('Database initialized successfully');
}

function runMigrations(db: ReturnType<typeof getDatabase>): void {
  const tableInfo = db.prepare("PRAGMA table_info(recipe)").all() as Array<{ name: string }>;
  const columns = new Set(tableInfo.map((col) => col.name));

  // Add last_viewed_at column if missing
  if (!columns.has('last_viewed_at')) {
    console.log('Adding last_viewed_at column to recipe table...');
    db.exec('ALTER TABLE recipe ADD COLUMN last_viewed_at TEXT');
    db.exec('CREATE INDEX IF NOT EXISTS idx_recipe_last_viewed_at ON recipe(last_viewed_at)');
  }

  // Add image_url column if missing
  if (!columns.has('image_url')) {
    console.log('Adding image_url column to recipe table...');
    db.exec('ALTER TABLE recipe ADD COLUMN image_url TEXT');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    initializeDatabase();
    closeDatabase();
    console.log('Database setup complete');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}
