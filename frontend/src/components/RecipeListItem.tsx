import type { RecipeWithTags } from '../../../shared/types/recipe';

interface RecipeListItemProps {
  recipe: RecipeWithTags;
  isSelected: boolean;
  onClick: () => void;
}

export function RecipeListItem({ recipe, isSelected, onClick }: RecipeListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`recipe-list-item ${isSelected ? 'selected' : ''}`}
    >
      <div className="recipe-list-item-main">
        {recipe.imageUrl && (
          <div className="recipe-list-item-thumb">
            <img src={recipe.imageUrl} alt="" />
          </div>
        )}
        <div className="recipe-list-item-content">
          <div className="recipe-list-item-header">
            <h3 className="recipe-list-item-title">{recipe.title}</h3>
            {recipe.rating && (
              <span className="recipe-list-item-rating">
                {'★'.repeat(recipe.rating)}
                {'☆'.repeat(5 - recipe.rating)}
              </span>
            )}
          </div>
          {recipe.tags.length > 0 && (
            <div className="recipe-list-item-tags">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="recipe-list-item-tag">
                  {tag.name}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="recipe-list-item-more">+{recipe.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .recipe-list-item {
          display: block;
          width: 100%;
          padding: 0.75rem;
          text-align: left;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-border);
          transition: background-color 0.15s ease;
        }
        .recipe-list-item:hover {
          background-color: var(--color-bg);
        }
        .recipe-list-item.selected {
          background-color: rgba(13, 110, 253, 0.1);
          border-left: 3px solid var(--color-primary);
          margin-left: -3px;
        }
        .recipe-list-item-main {
          display: flex;
          gap: 0.75rem;
        }
        .recipe-list-item-thumb {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
        }
        .recipe-list-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .recipe-list-item-content {
          flex: 1;
          min-width: 0;
        }
        .recipe-list-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .recipe-list-item-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          color: var(--color-text);
        }
        .recipe-list-item-rating {
          font-size: 0.75rem;
          color: #ffc107;
          flex-shrink: 0;
        }
        .recipe-list-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.375rem;
        }
        .recipe-list-item-tag {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          background: var(--color-bg);
          border-radius: 4px;
          color: var(--color-text-muted);
        }
        .recipe-list-item-more {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </button>
  );
}
