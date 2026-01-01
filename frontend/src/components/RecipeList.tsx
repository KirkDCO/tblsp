import { RecipeListItem } from './RecipeListItem';
import type { RecipeWithTags } from '../../../shared/types/recipe';

interface RecipeListProps {
  recipes: RecipeWithTags[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
  total?: number;
}

export function RecipeList({ recipes, selectedId, onSelect, isLoading, total }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="recipe-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipes...</p>
        <style>{`
          .recipe-list-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: var(--color-text-muted);
          }
          .loading-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--color-border);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 0.5rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="recipe-list-empty">
        <p>No recipes found</p>
        <p className="recipe-list-empty-hint">Try adjusting your search or filters</p>
        <style>{`
          .recipe-list-empty {
            padding: 2rem;
            text-align: center;
            color: var(--color-text-muted);
          }
          .recipe-list-empty-hint {
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      {total !== undefined && (
        <div className="recipe-list-count">
          {total} {total === 1 ? 'recipe' : 'recipes'}
        </div>
      )}
      <div className="recipe-list-items">
        {recipes.map((recipe) => (
          <RecipeListItem
            key={recipe.id}
            recipe={recipe}
            isSelected={recipe.id === selectedId}
            onClick={() => onSelect(recipe.id)}
          />
        ))}
      </div>
      <style>{`
        .recipe-list {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .recipe-list-count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        .recipe-list-items {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
