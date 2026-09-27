import StoryCard from './StoryCard';

export default function StoryGrid({ stories, favorites, cart, ratings, onOpen, onToggleFav, onToggleCart }) {
  if (stories.length === 0) {
    return (
      <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-faint)' }}>
        Nothing here yet. Try another genre, or clear your wishlist filter.
      </div>
    );
  }

  return (
    <div className="story-grid">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          isFav={favorites.includes(story.id)}
          inCart={cart.includes(story.id)}
          ratingMap={ratings[story.id]}
          onOpen={onOpen}
          onToggleFav={onToggleFav}
          onToggleCart={onToggleCart}
        />
      ))}
    </div>
  );
}
