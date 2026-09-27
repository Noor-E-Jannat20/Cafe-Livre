import { useState } from 'react';
import { useApp } from '../state/store';
import { genres } from '../data/stories';

const accents = ['sky', 'butter', 'pink'];

export default function SellModal({ onClose }) {
  const { addStory } = useApp();
  const [form, setForm] = useState({ name: '', description: '', genre: genres[1] || 'Whimsical', price: '2.00' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    const accent = accents[Math.floor(Math.random() * accents.length)];
    const result = addStory({ ...form, accent });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(true);
    setTimeout(onClose, 900);
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label="List a new story">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>List a story</h2>
        <p className="modal-author">It&rsquo;ll appear on the shelf under your seller name right away.</p>

        {success ? (
          <p className="auth-hint" style={{ marginTop: 20 }}>
            Added to the shelf ✨
          </p>
        ) : (
          <form className="auth-form" onSubmit={submit}>
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
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price ($)
                <input type="number" min="0.5" step="0.25" value={form.price} onChange={(e) => update('price', e.target.value)} required />
              </label>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
              Add to shelf
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
