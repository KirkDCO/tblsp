import type { TagSuggestion } from '../../../shared/types/tag';

interface SuggestedTagsProps {
  suggestions: TagSuggestion[];
  selectedTagIds: number[];
  onAddTag: (tagId: number | null, tagName: string) => void;
  isLoading?: boolean;
}

export function SuggestedTags({ suggestions, selectedTagIds, onAddTag, isLoading }: SuggestedTagsProps) {
  if (isLoading) {
    return <div className="suggested-tags-loading">Analyzing recipe...</div>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  // Filter out already selected tags
  const unselectedSuggestions = suggestions.filter(
    (s) => s.existingTagId === null || !selectedTagIds.includes(s.existingTagId)
  );

  if (unselectedSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggested-tags">
      <p className="suggested-tags-label">Suggested tags:</p>
      <div className="suggested-tags-list">
        {unselectedSuggestions.slice(0, 5).map((suggestion) => (
          <button
            key={suggestion.name}
            type="button"
            onClick={() => onAddTag(suggestion.existingTagId, suggestion.name)}
            className="suggested-tag"
            title={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
          >
            + {suggestion.name}
          </button>
        ))}
      </div>
      <style>{`
        .suggested-tags {
          margin-top: 0.5rem;
        }
        .suggested-tags-loading {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          font-style: italic;
        }
        .suggested-tags-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 0 0 0.375rem 0;
        }
        .suggested-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }
        .suggested-tag {
          padding: 0.25rem 0.5rem;
          background: #e0f2fe;
          border: 1px dashed #0284c7;
          border-radius: 100px;
          color: #0284c7;
          font-size: 0.75rem;
          transition: all 0.15s ease;
        }
        .suggested-tag:hover {
          background: #0284c7;
          color: white;
          border-style: solid;
        }
      `}</style>
    </div>
  );
}
