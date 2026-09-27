export function average(ratingMap) {
  const values = Object.values(ratingMap || {});
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function StarDisplay({ value, count }) {
  const rounded = value ? Math.round(value) : 0;
  return (
    <span className="star-display" aria-label={value ? `${value.toFixed(1)} out of 5 stars` : 'No ratings yet'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
      {value ? (
        <span className="star-count">
          {value.toFixed(1)} {count ? `(${count})` : ''}
        </span>
      ) : (
        <span className="star-count">Not yet rated</span>
      )}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <span className="star-input" role="radiogroup" aria-label="Rate this story">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          className={n <= value ? 'star filled' : 'star'}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}
