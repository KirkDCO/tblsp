import { useState } from 'react';
import { useTags } from '../hooks/useTags';
import type { Tag } from '../../../shared/types/tag';

interface TagPickerProps {
  selectedTags: Tag[];
  onChange: (tagIds: number[]) => void;
  disabled?: boolean;
}

export function TagPicker({ selectedTags, onChange, disabled }: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: allTags, isLoading } = useTags();

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const handleToggle = (tagId: number) => {
    if (disabled) return;
    const newIds = selectedIds.has(tagId)
      ? [...selectedIds].filter((id) => id !== tagId)
      : [...selectedIds, tagId];
    onChange(newIds);
  };

  if (isLoading) {
    return <div className="tag-picker-loading">Loading tags...</div>;
  }

  return (
    <div className="tag-picker">
      <div className="selected-tags">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <span key={tag.id} className="selected-tag">
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleToggle(tag.id)}
                  className="remove-tag"
                  title="Remove tag"
                >
                  ×
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="no-tags">No tags</span>
        )}
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="add-tag-btn"
          >
            {isOpen ? 'Done' : '+ Add'}
          </button>
        )}
      </div>

      {isOpen && allTags && (
        <div className="tag-dropdown">
          {allTags.length === 0 ? (
            <p className="no-available-tags">No tags available</p>
          ) : (
            allTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleToggle(tag.id)}
                className={`tag-option ${selectedIds.has(tag.id) ? 'selected' : ''}`}
              >
                {selectedIds.has(tag.id) && <span className="checkmark">✓</span>}
                {tag.name}
              </button>
            ))
          )}
        </div>
      )}

      <style>{`
        .tag-picker {
          position: relative;
        }
        .tag-picker-loading {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .selected-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: var(--color-bg);
          border-radius: 100px;
          font-size: 0.875rem;
        }
        .remove-tag {
          background: none;
          border: none;
          padding: 0;
          font-size: 1rem;
          color: var(--color-text-muted);
          line-height: 1;
        }
        .remove-tag:hover {
          color: #dc2626;
        }
        .no-tags {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }
        .add-tag-btn {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: 1px dashed var(--color-border);
          border-radius: 100px;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        .add-tag-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .tag-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          min-width: 200px;
          overflow-y: auto;
          z-index: 10;
        }
        .no-available-tags {
          padding: 1rem;
          color: var(--color-text-muted);
          text-align: center;
          font-size: 0.875rem;
        }
        .tag-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: none;
          border: none;
          text-align: left;
          font-size: 0.875rem;
        }
        .tag-option:hover {
          background: var(--color-bg);
        }
        .tag-option.selected {
          background: rgba(13, 110, 253, 0.1);
        }
        .checkmark {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
