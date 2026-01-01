interface AddRecipeButtonProps {
  onClick: () => void;
}

export function AddRecipeButton({ onClick }: AddRecipeButtonProps) {
  return (
    <>
      <button type="button" onClick={onClick} className="add-recipe-btn">
        + Add Recipe
      </button>
      <style>{`
        .add-recipe-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--color-primary);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .add-recipe-btn:hover {
          background: var(--color-primary-hover);
        }
      `}</style>
    </>
  );
}
