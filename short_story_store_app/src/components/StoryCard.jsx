import { StarDisplay, average } from './RatingStars';

export default function StoryCard({ story, isFav, inCart, ratingMap, onOpen, onToggleFav, onToggleCart }) {
  const avg = average(ratingMap);
  const count = ratingMap ? Object.keys(ratingMap).length : 0;

  return (
    <article className={`story-card glass accent-${story.accent}`}>
      <div className="card-top-row">
        <span className="genre-tag">{story.genre}</span>
        <span className="price-tag">${story.price.toFixed(2)}</span>
      </div>
      <h3>{story.title}</h3>
      <p className="story-author">
        sold by @{story.sellerId} · {story.minutes} min read
      </p>
      <StarDisplay value={avg} count={count} />
      <p className="story-blurb">{story.blurb}</p>
      <p className="sale-count">{story.saleCount} sold</p>
      <div className="card-bottom-row">
        <button className="read-btn" onClick={() => onOpen(story.id)}>
          Read the opening
        </button>
        <button
          className={`fav-btn${isFav ? ' active' : ''}`}
          onClick={() => onToggleFav(story.id)}
          aria-pressed={isFav}
          aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          title="Wishlist"
        >
          {isFav ? '♥' : '♡'}
        </button>
        <button
          className={`add-btn${inCart ? ' added' : ''}`}
          onClick={() => onToggleCart(story.id)}
          aria-pressed={inCart}
          aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
          title={inCart ? 'In cart' : 'Add to cart'}
        >
          {inCart ? '✓' : '+'}
        </button>
      </div>
    </article>
  );
}
