import { useState, useEffect } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({ value, onChange, placeholder = 'Search recipes...' }: SearchBoxProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <div className="search-box">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="search-clear"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      <style>{`
        .search-box {
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 2rem 0.75rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 1rem;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .search-clear {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--color-text-muted);
          padding: 0.25rem;
        }
        .search-clear:hover {
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
