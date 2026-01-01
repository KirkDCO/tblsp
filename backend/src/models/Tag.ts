import { getDatabase } from '../db/connection.js';
import type { Tag, TagWithCount } from '../../../shared/types/tag.js';

interface TagRow {
  id: number;
  name: string;
  name_lower: string;
  created_at: string;
}

interface TagWithCountRow extends TagRow {
  recipe_count: number;
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function rowToTagWithCount(row: TagWithCountRow): TagWithCount {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    recipeCount: row.recipe_count,
  };
}

export const TagModel = {
  findAll(): Tag[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tag ORDER BY name');
    const rows = stmt.all() as TagRow[];
    return rows.map(rowToTag);
  },

  findAllWithCounts(): TagWithCount[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT
        t.*,
        COUNT(r.id) as recipe_count
      FROM tag t
      LEFT JOIN recipe_tag rt ON rt.tag_id = t.id
      LEFT JOIN recipe r ON r.id = rt.recipe_id AND r.deleted_at IS NULL
      GROUP BY t.id
      ORDER BY t.name
    `);
    const rows = stmt.all() as TagWithCountRow[];
    return rows.map(rowToTagWithCount);
  },

  findById(id: number): Tag | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tag WHERE id = ?');
    const row = stmt.get(id) as TagRow | undefined;
    return row ? rowToTag(row) : null;
  },

  findByName(name: string): Tag | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tag WHERE name_lower = ?');
    const row = stmt.get(name.toLowerCase().trim()) as TagRow | undefined;
    return row ? rowToTag(row) : null;
  },

  create(name: string): Tag {
    const db = getDatabase();
    const trimmedName = name.trim();
    const nameLower = trimmedName.toLowerCase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tag (name, name_lower, created_at)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(trimmedName, nameLower, now);

    return {
      id: result.lastInsertRowid as number,
      name: trimmedName,
      createdAt: now,
    };
  },

  update(id: number, name: string): Tag | null {
    const db = getDatabase();
    const trimmedName = name.trim();
    const nameLower = trimmedName.toLowerCase();

    const stmt = db.prepare(`
      UPDATE tag SET name = ?, name_lower = ?
      WHERE id = ?
    `);
    const result = stmt.run(trimmedName, nameLower, id);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  },

  delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM tag WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  findOrCreate(name: string): Tag {
    const existing = this.findByName(name);
    if (existing) {
      return existing;
    }
    return this.create(name);
  },

  getTagsForRecipe(recipeId: number): Tag[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT t.id, t.name, t.name_lower, t.created_at
      FROM tag t
      JOIN recipe_tag rt ON rt.tag_id = t.id
      WHERE rt.recipe_id = ?
      ORDER BY t.name
    `);
    const rows = stmt.all(recipeId) as TagRow[];
    return rows.map(rowToTag);
  },

  setTagsForRecipe(recipeId: number, tagIds: number[]): void {
    const db = getDatabase();
    const now = new Date().toISOString();

    // Remove existing tags
    const deleteStmt = db.prepare('DELETE FROM recipe_tag WHERE recipe_id = ?');
    deleteStmt.run(recipeId);

    // Add new tags
    const insertStmt = db.prepare(`
      INSERT INTO recipe_tag (recipe_id, tag_id, created_at)
      VALUES (?, ?, ?)
    `);
    for (const tagId of tagIds) {
      insertStmt.run(recipeId, tagId, now);
    }
  },

  addTagToRecipe(recipeId: number, tagId: number): boolean {
    const db = getDatabase();
    const now = new Date().toISOString();

    try {
      const stmt = db.prepare(`
        INSERT INTO recipe_tag (recipe_id, tag_id, created_at)
        VALUES (?, ?, ?)
      `);
      stmt.run(recipeId, tagId, now);
      return true;
    } catch {
      // Already exists or foreign key constraint
      return false;
    }
  },

  removeTagFromRecipe(recipeId: number, tagId: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM recipe_tag WHERE recipe_id = ? AND tag_id = ?');
    const result = stmt.run(recipeId, tagId);
    return result.changes > 0;
  },
};
