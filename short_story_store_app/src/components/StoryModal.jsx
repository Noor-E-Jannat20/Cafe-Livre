import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/store';
import { StarDisplay, StarInput, average } from './RatingStars';

export default function StoryModal({
  story,
  isFav,
  inCart,
  onClose,
  onToggleFav,
  onToggleCart,
  onOpenStory,
}) {
  const { session, ratings, responses, rateStory, addResponse, stories } = useApp();
  const panelRef = useRef(null);

  const [draft, setDraft] = useState('');
  const [showFullStory, setShowFullStory] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();

    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();

    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset the story view whenever a different story is opened.
  useEffect(() => {
    setShowFullStory(false);
  }, [story?.id]);

  if (!story) return null;

  const ratingMap = ratings[story.id] || {};
  const avg = average(ratingMap);
  const myRating = session ? ratingMap[session] || 0 : 0;
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

  function submitResponse(e) {
    e.preventDefault();

    if (!draft.trim()) return;

    addResponse(story.id, draft);
    setDraft('');
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

        <div className="modal-meta">
          <span className="genre-tag">{story.genre}</span>
          <span>{story.minutes} min read</span>
          <span>·</span>
          <span>${story.price.toFixed(2)}</span>
          <span>·</span>
          <span>{story.saleCount} sold</span>
        </div>

        <h2>{story.title}</h2>

        <p className="modal-author">
          sold by @{story.sellerId}
        </p>

        <StarDisplay
          value={avg}
          count={Object.keys(ratingMap).length}
        />

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
          <button
            className={`add-btn${inCart ? ' added' : ''}`}
            style={{
              width: 'auto',
              padding: '0 20px',
              borderRadius: '999px',
            }}
            onClick={() => onToggleCart(story.id)}
          >
            {inCart ? '✓ In cart' : '+ Add to cart'}
          </button>

          <button
            className={`fav-btn${isFav ? ' active' : ''}`}
            onClick={() => onToggleFav(story.id)}
            aria-pressed={isFav}
            aria-label={
              isFav
                ? 'Remove from wishlist'
                : 'Add to wishlist'
            }
          >
            {isFav ? '♥' : '♡'}
          </button>
        </div>

        <div className="modal-section">
          <h3 className="modal-subhead">Rate this story</h3>

          {session ? (
            <StarInput
              value={myRating}
              onChange={(v) => rateStory(story.id, v)}
            />
          ) : (
            <p className="auth-hint">
              Log in to rate and review.
            </p>
          )}
        </div>

        <div className="modal-section">
          <h3 className="modal-subhead">
            Responses ({storyResponses.length})
          </h3>

          <div className="response-list">
            {storyResponses.length === 0 && (
              <p className="auth-hint">
                No responses yet — be the first.
              </p>
            )}

            {storyResponses.map((r, i) => (
              <div className="response-item" key={i}>
                <span className="response-author">
                  @{r.username}
                </span>

                <span className="response-date">
                  {r.date}
                </span>

                <p>{r.responses}</p>
              </div>
            ))}
          </div>

          {session ? (
            <form
              className="response-form"
              onSubmit={submitResponse}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What did you think?"
                aria-label="Write a response"
              />

              <button className="btn-ghost" type="submit">
                Post
              </button>
            </form>
          ) : (
            <p className="auth-hint">
              Log in to leave a response.
            </p>
          )}
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