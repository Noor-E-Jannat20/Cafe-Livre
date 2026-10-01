export default function GenreFilter({ genres, active, onSelect }) {
  return (
    <div className="genre-row" role="tablist" aria-label="Filter by genre">
      {genres.map((g) => (
        <button
          key={g}
          role="tab"
          aria-selected={active === g}
          className={`genre-chip${active === g ? ' active' : ''}`}
          onClick={() => onSelect(g)}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
