import { useState } from 'react';

interface DeleteRecipeButtonProps {
  onDelete: () => void;
  isDeleting?: boolean;
  recipeName: string;
}

export function DeleteRecipeButton({ onDelete, isDeleting, recipeName }: DeleteRecipeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="delete-confirm">
        <p>Move "{recipeName}" to trash?</p>
        <div className="delete-confirm-actions">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setShowConfirm(false);
            }}
            disabled={isDeleting}
            className="btn-danger"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        <style>{`
          .delete-confirm {
            padding: 1rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
          }
          .delete-confirm p {
            margin: 0 0 0.75rem 0;
            color: #991b1b;
          }
          .delete-confirm-actions {
            display: flex;
            gap: 0.5rem;
          }
          .btn-secondary {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 4px;
          }
          .btn-danger {
            padding: 0.5rem 1rem;
            background: #dc2626;
            border: none;
            border-radius: 4px;
            color: white;
          }
          .btn-danger:hover:not(:disabled) {
            background: #b91c1c;
          }
          .btn-danger:disabled {
            opacity: 0.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} className="delete-btn">
        Delete
      </button>
      <style>{`
        .delete-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #dc2626;
          border-radius: 4px;
          color: #dc2626;
          font-size: 0.875rem;
        }
        .delete-btn:hover {
          background: #fef2f2;
        }
      `}</style>
    </>
  );
}
