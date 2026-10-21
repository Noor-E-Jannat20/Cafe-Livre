import { useState } from 'react';
import { useApp } from '../state/store';

export default function RecommendModal({ story, onClose, onGoFriends }) {
  const { friends, users, recommendStory } = useApp();
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function toggle(name) {
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    const result = recommendStory(story.id, picked, note);
    if (!result.ok) return setError(result.message);
    setSent(true);
    setTimeout(onClose, 1100);
  }

  const nameOf = (u) => users.find((x) => x.username === u)?.displayName || u;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label={`Recommend ${story.title}`} style={{ width: 'min(520px, 100%)' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Recommend to a friend</h2>
        <p className="modal-author">“{story.title}” by @{story.sellerId}</p>

        {sent ? (
          <p className="auth-hint" style={{ marginTop: 20 }}>Sent ✨ They’ll see it under Recommended for me.</p>
        ) : friends.length === 0 ? (
          <div style={{ marginTop: 16 }}>
            <p className="auth-hint">You haven’t added any friends yet. Add a reader by username, then recommend away.</p>
            <button className="btn-primary" style={{ border: 'none', marginTop: 12 }} onClick={onGoFriends}>
              Find friends
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <fieldset className="friend-pick">
              <legend>Send to</legend>
              {friends.map((f) => (
                <label key={f} className={`friend-chip${picked.includes(f) ? ' active' : ''}`}>
                  <input type="checkbox" checked={picked.includes(f)} onChange={() => toggle(f)} />
                  {nameOf(f)} <span>@{f}</span>
                </label>
              ))}
            </fieldset>
            <label>
              Add a note (optional)
              <textarea rows={3} maxLength={240} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why you think they’ll love it" />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
              Send recommendation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
