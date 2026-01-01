export type SortOption = 'title' | 'rating' | 'created_at' | 'updated_at' | 'last_viewed_at' | 'random';

interface SortControlsProps {
  sort: SortOption;
  order: 'asc' | 'desc';
  onSortChange: (sort: SortOption) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
  onShuffle?: () => void;
}

export function SortControls({ sort, order, onSortChange, onOrderChange, onShuffle }: SortControlsProps) {
  return (
    <div className="sort-controls">
      <label className="sort-label">
        Sort by:
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="sort-select"
        >
          <option value="created_at">Date Added</option>
          <option value="updated_at">Last Updated</option>
          <option value="last_viewed_at">Recently Viewed</option>
          <option value="title">Title</option>
          <option value="rating">Rating</option>
          <option value="random">Random</option>
        </select>
      </label>
      {sort === 'random' && onShuffle && (
        <button
          type="button"
          onClick={onShuffle}
          className="order-button"
          title="Shuffle again"
        >
          ↻
        </button>
      )}
      {sort !== 'random' && (
        <button
          type="button"
          onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
          className="order-button"
          title={order === 'asc' ? 'Ascending' : 'Descending'}
        >
          {order === 'asc' ? '↑' : '↓'}
        </button>
      )}
      <style>{`
        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .sort-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        .sort-select {
          padding: 0.375rem 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-surface);
          font-size: 0.875rem;
        }
        .sort-select:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .order-button {
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-surface);
          font-size: 1rem;
        }
        .order-button:hover {
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
