import { useState, useEffect, useCallback, useRef } from 'react';
import type { RecipeDetail, RecipeInput } from '../../../shared/types/recipe';
import type { TagSuggestion } from '../../../shared/types/tag';
import { useTags } from '../hooks/useTags';
import { useCreateTag } from '../hooks/useCreateTag';
import { useSuggestTags } from '../hooks/useSuggestTags';
import { useUploadImage } from '../hooks/useUploadImage';
import { SuggestedTags } from './SuggestedTags';

interface RecipeFormProps {
  recipe?: RecipeDetail | null;
  onSubmit: (input: RecipeInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function RecipeForm({ recipe, onSubmit, onCancel, isSubmitting, error }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [ingredientsRaw, setIngredientsRaw] = useState(recipe?.ingredientsRaw ?? '');
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '');
  const [notes, setNotes] = useState(recipe?.notes ?? '');
  const [sourceUrl, setSourceUrl] = useState(recipe?.sourceUrl ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    recipe?.tags.map((t) => t.id) ?? []
  );
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(recipe?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tags } = useTags();
  const createTagMutation = useCreateTag();
  const suggestMutation = useSuggestTags();
  const uploadMutation = useUploadImage();

  // Debounced tag suggestion
  useEffect(() => {
    if (!title && !ingredientsRaw && !instructions) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      suggestMutation.mutate(
        { title, ingredientsRaw, instructions },
        {
          onSuccess: (data) => setSuggestions(data.suggestions),
        }
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [title, ingredientsRaw, instructions]);

  const handleAddSuggestedTag = useCallback(async (tagId: number | null, tagName: string) => {
    if (tagId !== null) {
      // Existing tag
      setSelectedTagIds((prev) => [...prev, tagId]);
    } else {
      // New tag - create it first, then add to selection
      try {
        const newTag = await createTagMutation.mutateAsync(tagName);
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        setSuggestions((prev) => prev.filter((s) => s.name !== tagName));
      } catch {
        // Error handled by mutation
      }
    }
  }, [createTagMutation]);

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setIngredientsRaw(recipe.ingredientsRaw);
      setInstructions(recipe.instructions);
      setNotes(recipe.notes ?? '');
      setSourceUrl(recipe.sourceUrl ?? '');
      setSelectedTagIds(recipe.tags.map((t) => t.id));
      setImageUrl(recipe.imageUrl ?? null);
    }
  }, [recipe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      ingredientsRaw: ingredientsRaw.trim(),
      instructions: instructions.trim(),
      notes: notes.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      imageUrl: imageUrl || null,
      tagIds: selectedTagIds,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync(file);
      setImageUrl(result.imageUrl);
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    try {
      const newTag = await createTagMutation.mutateAsync(trimmed);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName('');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="ingredients">Ingredients *</label>
        <textarea
          id="ingredients"
          value={ingredientsRaw}
          onChange={(e) => setIngredientsRaw(e.target.value)}
          required
          rows={8}
          placeholder="Enter each ingredient on a new line"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="instructions">Instructions *</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={10}
          placeholder="Enter cooking instructions"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional notes or tips"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="sourceUrl">Source URL</label>
        <input
          type="url"
          id="sourceUrl"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com/recipe"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Photo</label>
        <div className="image-upload">
          {imageUrl ? (
            <div className="image-preview">
              <img src={imageUrl} alt="Recipe" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-btn"
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="image-upload-prompt">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={isSubmitting || uploadMutation.isPending}
                id="recipe-image"
              />
              <label htmlFor="recipe-image" className="upload-label">
                {uploadMutation.isPending ? 'Uploading...' : 'Choose photo'}
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Tags</label>
        {tags && tags.length > 0 && (
          <div className="tag-selector">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`tag-option ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                disabled={isSubmitting}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
        <SuggestedTags
          suggestions={suggestions}
          selectedTagIds={selectedTagIds}
          onAddTag={handleAddSuggestedTag}
          isLoading={suggestMutation.isPending}
        />
        <div className="new-tag-input">
          <input
            type="text"
            placeholder="Create new tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag();
              }
            }}
            disabled={isSubmitting || createTagMutation.isPending}
          />
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={isSubmitting || createTagMutation.isPending || !newTagName.trim()}
            className="btn-add-tag"
          >
            {createTagMutation.isPending ? 'Adding...' : 'Add Tag'}
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>

      <style>{`
        .recipe-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 800px;
        }
        .form-error {
          padding: 1rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-weight: 500;
          color: var(--color-text);
        }
        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 1rem;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .form-group input:disabled,
        .form-group textarea:disabled {
          background: var(--color-bg);
        }
        .tag-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tag-option {
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 100px;
          background: var(--color-surface);
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }
        .tag-option:hover:not(:disabled) {
          border-color: var(--color-primary);
        }
        .tag-option.selected {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .tag-option:disabled {
          opacity: 0.5;
        }
        .new-tag-input {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .new-tag-input input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .new-tag-input input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .btn-add-tag {
          padding: 0.5rem 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 0.875rem;
          white-space: nowrap;
        }
        .btn-add-tag:hover:not(:disabled) {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .btn-add-tag:disabled {
          opacity: 0.5;
        }
        .image-upload {
          margin-top: 0.5rem;
        }
        .image-preview {
          position: relative;
          display: inline-block;
        }
        .image-preview img {
          max-width: 200px;
          max-height: 150px;
          border-radius: 4px;
          object-fit: cover;
        }
        .remove-image-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .remove-image-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        .image-upload-prompt input[type="file"] {
          display: none;
        }
        .upload-label {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--color-surface);
          border: 1px dashed var(--color-border);
          border-radius: 4px;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .upload-label:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }
        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
        }
        .btn-primary {
          background: var(--color-primary);
          border: none;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-hover);
        }
        .btn-primary:disabled {
          opacity: 0.5;
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--color-bg);
        }
      `}</style>
    </form>
  );
}
