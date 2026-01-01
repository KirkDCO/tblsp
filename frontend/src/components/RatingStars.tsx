interface RatingStarsProps {
  rating: number | null;
  onChange?: (rating: number | null) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function RatingStars({ rating, onChange, readonly = false, size = 'medium' }: RatingStarsProps) {
  const handleClick = (newRating: number) => {
    if (readonly || !onChange) return;
    // If clicking the same rating, remove it
    if (rating === newRating) {
      onChange(null);
    } else {
      onChange(newRating);
    }
  };

  return (
    <div className={`rating-stars rating-stars-${size} ${readonly ? 'readonly' : 'interactive'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={`star ${rating !== null && star <= rating ? 'filled' : 'empty'}`}
          disabled={readonly}
          title={readonly ? undefined : star === rating ? 'Click to remove rating' : `Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          {rating !== null && star <= rating ? '★' : '☆'}
        </button>
      ))}
      <style>{`
        .rating-stars {
          display: inline-flex;
          gap: 0.125rem;
        }
        .rating-stars-small .star {
          font-size: 1rem;
        }
        .rating-stars-medium .star {
          font-size: 1.5rem;
        }
        .rating-stars-large .star {
          font-size: 2rem;
        }
        .star {
          background: none;
          border: none;
          padding: 0;
          color: #ffc107;
          cursor: default;
          transition: transform 0.1s ease;
        }
        .rating-stars.interactive .star {
          cursor: pointer;
        }
        .rating-stars.interactive .star:hover {
          transform: scale(1.15);
        }
        .star.empty {
          color: #e0e0e0;
        }
        .rating-stars.interactive .star.empty:hover {
          color: #ffc107;
        }
        .star:disabled {
          cursor: default;
        }
      `}</style>
    </div>
  );
}
