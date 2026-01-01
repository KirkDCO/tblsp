import { useState } from 'react';
import { useImportRecipe } from '../hooks/useImportRecipe';
import { RecipeForm } from './RecipeForm';
import type { RecipeInput, ImportedRecipe } from '../../../shared/types/recipe';
import { ApiClientError } from '../services/api';

interface ImportDialogProps {
  onSave: (input: RecipeInput) => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveError?: string | null;
}

export function ImportDialog({ onSave, onCancel, isSaving, saveError }: ImportDialogProps) {
  const [url, setUrl] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const importMutation = useImportRecipe();

  const handleImport = async () => {
    if (!url.trim()) {
      setImportError('Please enter a URL');
      return;
    }

    setImportError(null);

    try {
      const recipe = await importMutation.mutateAsync({ url: url.trim() });
      setImportedRecipe(recipe);
      setSelectedImageUrl(recipe.imageUrl);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setImportError(err.message);
      } else {
        setImportError('Failed to import recipe. Please check the URL and try again.');
      }
    }
  };

  const handleSave = (input: RecipeInput) => {
    onSave({
      ...input,
      sourceUrl: importedRecipe?.sourceUrl ?? url.trim(),
    });
  };

  if (importedRecipe) {
    const availableImages = importedRecipe.availableImages || [];

    return (
      <div className="import-dialog">
        <div className="import-preview-header">
          <h2>Review Imported Recipe</h2>
          {importedRecipe.extractionConfidence < 0.7 && (
            <p className="import-warning">
              The recipe extraction may not be complete. Please review and edit as needed.
            </p>
          )}
        </div>

        {availableImages.length > 0 && (
          <div className="image-selection">
            <label>Select a photo:</label>
            <div className="image-options">
              <button
                type="button"
                className={`image-option ${selectedImageUrl === null ? 'selected' : ''}`}
                onClick={() => setSelectedImageUrl(null)}
              >
                <div className="no-image-placeholder">No photo</div>
              </button>
              {availableImages.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  className={`image-option ${selectedImageUrl === imgUrl ? 'selected' : ''}`}
                  onClick={() => setSelectedImageUrl(imgUrl)}
                >
                  <img src={imgUrl} alt={`Option ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        <RecipeForm
          recipe={{
            id: 0,
            title: importedRecipe.title,
            ingredientsRaw: importedRecipe.ingredientsRaw,
            instructions: importedRecipe.instructions,
            notes: null,
            sourceUrl: importedRecipe.sourceUrl,
            imageUrl: selectedImageUrl,
            rating: null,
            createdAt: '',
            updatedAt: '',
            tags: [],
            ingredients: [],
          }}
          onSubmit={handleSave}
          onCancel={onCancel}
          isSubmitting={isSaving}
          error={saveError}
        />
        <style>{`
          .import-dialog {
            max-width: 800px;
          }
          .import-preview-header {
            margin-bottom: 1.5rem;
          }
          .import-preview-header h2 {
            margin: 0 0 0.5rem 0;
          }
          .import-warning {
            padding: 0.75rem;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 4px;
            color: #92400e;
            font-size: 0.875rem;
          }
          .image-selection {
            margin-bottom: 1.5rem;
          }
          .image-selection label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }
          .image-options {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          .image-option {
            padding: 0;
            border: 2px solid var(--color-border);
            border-radius: 8px;
            background: var(--color-surface);
            cursor: pointer;
            overflow: hidden;
            transition: all 0.15s ease;
          }
          .image-option:hover {
            border-color: var(--color-primary);
          }
          .image-option.selected {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
          }
          .image-option img {
            display: block;
            width: 100px;
            height: 75px;
            object-fit: cover;
          }
          .no-image-placeholder {
            width: 100px;
            height: 75px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-muted);
            font-size: 0.75rem;
            background: var(--color-bg);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="import-dialog">
      <h2>Import Recipe from URL</h2>
      <p className="import-description">
        Paste a recipe URL and we'll try to extract the ingredients and instructions automatically.
      </p>

      {importError && <div className="import-error">{importError}</div>}

      <div className="import-form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/recipe"
          className="import-url-input"
          disabled={importMutation.isPending}
        />
        <div className="import-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={importMutation.isPending}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importMutation.isPending || !url.trim()}
            className="btn-primary"
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      <style>{`
        .import-dialog {
          max-width: 600px;
        }
        .import-dialog h2 {
          margin: 0 0 0.5rem 0;
        }
        .import-description {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }
        .import-error {
          padding: 1rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          margin-bottom: 1rem;
        }
        .import-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .import-url-input {
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 1rem;
        }
        .import-url-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .import-url-input:disabled {
          background: var(--color-bg);
        }
        .import-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
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
    </div>
  );
}
