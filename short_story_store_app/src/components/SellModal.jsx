import { useState } from 'react';
import { useApp } from '../state/store';
import { genres } from '../data/stories';
import CoverUpload from './CoverUpload';

const accents = ['sky', 'butter', 'pink'];

// Registers a new story, or edits one when `story` is passed.
export default function SellModal({ onClose, story }) {
  const { addStory, updateStory } = useApp();
  const editing = !!story;
  const [form, setForm] = useState({
    name: story?.title || '',
    description: story?.text || '',
    genre: story?.genre || genres[1] || 'Whimsical',
    price: story ? String(story.price) : '2.00',
    cover: story?.cover || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    const result = editing
      ? updateStory(story.id, form)
      : addStory({ ...form, accent: accents[Math.floor(Math.random() * accents.length)] });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(true);
    setTimeout(onClose, 900);
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label={editing ? 'Edit story' : 'Register a story for sale'}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>{editing ? 'Edit story' : 'Register a story'}</h2>
        <p className="modal-author">
          {editing ? 'Changes show on the shelf right away.' : 'It’ll appear on the shelf under your seller name right away.'}
        </p>

        {success ? (
          <p className="auth-hint" style={{ marginTop: 20 }}>{editing ? 'Saved ✨' : 'Added to the shelf ✨'}</p>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <CoverUpload value={form.cover} onChange={(v) => update('cover', v)} required={!editing} />
            <label>
              Title
              <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </label>
            <label>
              Story text
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                required
                placeholder="Paste or write the full story here..."
              />
            </label>
            <div className="auth-row">
              <label>
                Genre
                <select value={form.genre} onChange={(e) => update('genre', e.target.value)}>
                  {genres.filter((g) => g !== 'All').map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label>
                Price ($)
                <input type="number" min="0.5" step="0.25" value={form.price} onChange={(e) => update('price', e.target.value)} required />
              </label>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
              {editing ? 'Save changes' : 'Add to shelf'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
