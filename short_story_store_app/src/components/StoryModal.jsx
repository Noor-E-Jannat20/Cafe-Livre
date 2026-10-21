import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/store';
import { StarDisplay, StarInput, average } from './RatingStars';
import CoverArt from './CoverArt';

function myRatingExists(map, user) {
  return !!user && !!map[user];
}

export default function StoryModal({
  story,
  isFav,
  inCart,
  onClose,
  onToggleFav,
  onToggleCart,
  onOpenStory,
  onRecommend,
}) {
  const { session, ratings, responses, saveReview, deleteReview, isAdmin, ownedIds, stories } = useApp();
  const panelRef = useRef(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [showFullStory, setShowFullStory] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();

    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();

    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset the story view and review form whenever a different story is opened.
  useEffect(() => {
    setShowFullStory(false);
    setReviewError('');
    const mine = session ? (responses[story?.id] || []).find((r) => r.username === session) : null;
    setReviewRating(session ? (ratings[story?.id] || {})[session] || 0 : 0);
    setReviewText(mine ? mine.responses : '');
    // Only re-run when the opened story or the signed-in reader changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, session]);

  if (!story) return null;

  const ratingMap = ratings[story.id] || {};
  const avg = average(ratingMap);
  const storyResponses = responses[story.id] || [];

  const related = stories
    .filter((s) => s.id !== story.id && s.genre === story.genre)
    .slice(0, 3);

  // Use the first paragraph as the opening.
  const paragraphs = story.text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const opening = paragraphs[0] || '';
  const fullStory = paragraphs.join('\n\n');

  const owned = ownedIds.includes(story.id);
  const isOwnStory = session === story.sellerId;
  const myReview = storyResponses.find((r) => r.username === session);

  function submitReview(e) {
    e.preventDefault();
    setReviewError('');
    const result = saveReview(story.id, { rating: reviewRating, text: reviewText });
    if (!result.ok && result.message) setReviewError(result.message);
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div
        className="modal-panel glass"
        tabIndex={-1}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={story.title}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close story"
        >
          ✕
        </button>

        <div className="modal-head">
          <div className="modal-cover"><CoverArt story={story} size="modal" /></div>
          <div className="modal-head-text">
            <div className="modal-meta">
              <span className="genre-tag">{story.genre}</span>
              <span>{story.minutes} min read</span>
              <span>·</span>
              <span>${story.price.toFixed(2)}</span>
              <span>·</span>
              <span>{story.saleCount} sold</span>
            </div>
            <h2>{story.title}</h2>
            <p className="modal-author">sold by @{story.sellerId}</p>
            <StarDisplay value={avg} count={Object.keys(ratingMap).length} />
          </div>
        </div>

        {/* Story opening / full story */}
        <div className="modal-text">
          {!showFullStory ? (
            <>
              <p>{opening}</p>

              <div className="story-continue">
                <span>...</span>

                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => setShowFullStory(true)}
                >
                  Continue reading
                </button>
              </div>
            </>
          ) : (
            paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          )}
        </div>

        <div className="modal-actions">
          {owned ? (
            <span className="owned-pill">✓ In your library</span>
          ) : (
            <button
              className={`add-btn${inCart ? ' added' : ''}`}
              style={{ width: 'auto', padding: '0 20px', borderRadius: '999px' }}
              onClick={() => onToggleCart(story.id)}
            >
              {inCart ? '✓ In cart' : '+ Add to cart'}
            </button>
          )}

          <button
            className={`fav-btn${isFav ? ' active' : ''}`}
            onClick={() => onToggleFav(story.id)}
            aria-pressed={isFav}
            aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isFav ? '♥' : '♡'}
          </button>

          <button className="btn-ghost" type="button" onClick={() => onRecommend(story.id)}>
            Recommend to a friend
          </button>
        </div>

        <div className="modal-section">
          <h3 className="modal-subhead">{myReview || myRatingExists(ratingMap, session) ? 'Your review' : 'Write a review'}</h3>
          {!session && <p className="auth-hint">Log in to rate and review.</p>}
          {session && isOwnStory && <p className="auth-hint">You can’t review your own story.</p>}
          {session && !isOwnStory && (
            <form className="review-form" onSubmit={submitReview}>
              <StarInput value={reviewRating} onChange={setReviewRating} />
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think? (optional)"
                aria-label="Write a review"
              />
              {reviewError && <p className="auth-error" role="alert">{reviewError}</p>}
              <button className="btn-ghost" type="submit">
                {myReview || myRatingExists(ratingMap, session) ? 'Update review' : 'Post review'}
              </button>
            </form>
          )}
        </div>

        <div className="modal-section">
          <h3 className="modal-subhead">Reviews ({storyResponses.length})</h3>
          <div className="response-list">
            {storyResponses.length === 0 && <p className="auth-hint">No written reviews yet. Be the first.</p>}
            {storyResponses.map((r) => (
              <div className="response-item" key={r.username}>
                <span className="response-author">@{r.username}</span>
                {ratingMap[r.username] ? <StarDisplay value={ratingMap[r.username]} /> : null}
                <span className="response-date">{r.date}</span>
                <p>{r.responses}</p>
                {(r.username === session || isAdmin) && (
                  <button className="remove-btn" type="button" onClick={() => deleteReview(story.id, r.username)}>
                    delete review
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="modal-section">
            <h3 className="modal-subhead">More like this</h3>

            <div className="related-row">
              {related.map((r) => (
                <button
                  className="related-chip"
                  key={r.id}
                  onClick={() => onOpenStory(r.id)}
                >
                  {r.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}