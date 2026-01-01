import type { RecipeDetail } from '../../../shared/types/recipe';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { RatingStars } from './RatingStars';
import { TagPicker } from './TagPicker';
import { useSetRating } from '../hooks/useSetRating';
import { useSetTags } from '../hooks/useSetTags';

interface RecipeViewProps {
  recipe: RecipeDetail | null;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function RecipeView({ recipe, isLoading, onEdit, onDelete, isDeleting }: RecipeViewProps) {
  const setRatingMutation = useSetRating();
  const setTagsMutation = useSetTags();

  const handleRatingChange = (rating: number | null) => {
    if (!recipe) return;
    setRatingMutation.mutate({ recipeId: recipe.id, rating });
  };

  const handleTagsChange = (tagIds: number[]) => {
    if (!recipe) return;
    setTagsMutation.mutate({ recipeId: recipe.id, tagIds });
  };
  if (isLoading) {
    return (
      <div className="recipe-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-view-empty">
        <p>Select a recipe to view details</p>
      </div>
    );
  }

  return (
    <article className="recipe-view">
      {recipe.imageUrl && (
        <div className="recipe-view-image">
          <img src={recipe.imageUrl} alt={recipe.title} />
        </div>
      )}
      <header className="recipe-view-header">
        <div className="recipe-view-header-top">
          <h1 className="recipe-view-title">{recipe.title}</h1>
          {(onEdit || onDelete) && (
            <div className="recipe-view-actions">
              {onEdit && (
                <button type="button" onClick={onEdit} className="btn-edit">
                  Edit
                </button>
              )}
              {onDelete && (
                <DeleteRecipeButton
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                  recipeName={recipe.title}
                />
              )}
            </div>
          )}
        </div>
        <div className="recipe-view-meta">
          <div className="recipe-view-rating-section">
            <span className="meta-label">Rating:</span>
            <RatingStars
              rating={recipe.rating}
              onChange={handleRatingChange}
              size="medium"
            />
          </div>
          <div className="recipe-view-tags-section">
            <span className="meta-label">Tags:</span>
            <TagPicker
              selectedTags={recipe.tags}
              onChange={handleTagsChange}
            />
          </div>
        </div>
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="recipe-view-source"
          >
            View original recipe
          </a>
        )}
      </header>

      <section className="recipe-view-section">
        <h2>Ingredients</h2>
        <ul className="recipe-view-ingredients">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.quantity && <span className="ingredient-quantity">{ingredient.quantity}</span>}
              {ingredient.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="recipe-view-section">
        <h2>Instructions</h2>
        <div className="recipe-view-instructions">
          {recipe.instructions.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {recipe.notes && (
        <section className="recipe-view-section">
          <h2>Notes</h2>
          <p className="recipe-view-notes">{recipe.notes}</p>
        </section>
      )}

      <style>{`
        .recipe-view {
          max-width: 800px;
        }
        .recipe-view-image {
          margin-bottom: 1.5rem;
          border-radius: 8px;
          overflow: hidden;
        }
        .recipe-view-image img {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
        }
        .recipe-view-loading,
        .recipe-view-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
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
        .recipe-view-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }
        .recipe-view-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .recipe-view-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .btn-edit {
          padding: 0.5rem 1rem;
          background: var(--color-primary);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 0.875rem;
        }
        .btn-edit:hover {
          background: var(--color-primary-hover);
        }
        .recipe-view-title {
          font-size: 2rem;
          font-weight: 600;
          margin: 0;
        }
        .recipe-view-meta {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .recipe-view-rating-section,
        .recipe-view-tags-section {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .meta-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          min-width: 50px;
          padding-top: 0.25rem;
        }
        .recipe-view-source {
          font-size: 0.875rem;
        }
        .recipe-view-section {
          margin-bottom: 2rem;
        }
        .recipe-view-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: var(--color-text);
        }
        .recipe-view-ingredients {
          list-style: disc;
          padding-left: 1.5rem;
        }
        .recipe-view-ingredients li {
          margin-bottom: 0.5rem;
        }
        .ingredient-quantity {
          font-weight: 500;
          margin-right: 0.25rem;
        }
        .recipe-view-instructions p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .recipe-view-notes {
          background: var(--color-bg);
          padding: 1rem;
          border-radius: 4px;
          font-style: italic;
        }
      `}</style>
    </article>
  );
}
