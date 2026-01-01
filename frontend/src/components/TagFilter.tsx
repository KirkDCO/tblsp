import type { TagWithCount } from '../../../shared/types/tag';

interface TagFilterProps {
  tags: TagWithCount[];
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  isLoading?: boolean;
}

export function TagFilter({ tags, selectedTags, onTagToggle, isLoading }: TagFilterProps) {
  if (isLoading) {
    return <div className="tag-filter-loading">Loading tags...</div>;
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tag-filter">
      <h3 className="tag-filter-title">Filter by Tag</h3>
      <div className="tag-list">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagToggle(tag.id)}
            className={`tag-button ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
          >
            {tag.name}
            <span className="tag-count">{tag.recipeCount}</span>
          </button>
        ))}
      </div>
      <style>{`
        .tag-filter {
          margin-top: 1rem;
        }
        .tag-filter-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tag-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 100px;
          background: var(--color-surface);
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }
        .tag-button:hover {
          border-color: var(--color-primary);
        }
        .tag-button.selected {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .tag-count {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .tag-button.selected .tag-count {
          color: rgba(255, 255, 255, 0.8);
        }
        .tag-filter-loading {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
