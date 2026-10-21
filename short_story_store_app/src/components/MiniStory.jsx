import CoverArt from './CoverArt';
import { StarDisplay, average } from './RatingStars';
import { useApp } from '../state/store';

// Compact story row used in the account page. Pass action buttons as children.
export default function MiniStory({ story, note, onOpen, children }) {
  const { ratings } = useApp();
  const map = ratings[story.id];
  return (
    <div className="mini-story glass">
      <button className="mini-cover" onClick={() => onOpen(story.id)} aria-label={`Open ${story.title}`}>
        <CoverArt story={story} size="mini" />
      </button>
      <div className="mini-body">
        <button className="mini-title" onClick={() => onOpen(story.id)}>{story.title}</button>
        <div className="mini-sub">@{story.sellerId} · {story.genre} · ${story.price.toFixed(2)}</div>
        <StarDisplay value={average(map)} count={map ? Object.keys(map).length : 0} />
        {note && <p className="mini-note">{note}</p>}
        <div className="mini-actions">{children}</div>
      </div>
    </div>
  );
}
