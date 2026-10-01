import { useState } from 'react';
import { useApp } from '../state/store';

export default function AuthModal({ onClose }) {
  const { login, signup } = useApp();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: '',
    dob: '',
    phone: '',
    type: 'buyer',
    referredBy: '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    const result =
      mode === 'login'
        ? login(form.username, form.password)
        : signup(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass auth-panel" role="dialog" aria-modal="true" aria-label="Log in or sign up">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => setMode('login')}>
            Log in
          </button>
          <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} onClick={() => setMode('signup')}>
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Username
            <input value={form.username} onChange={(e) => update('username', e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          </label>

          {mode === 'signup' && (
            <>
              <div className="auth-row">
                <label>
                  Date of birth
                  <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555 0100" />
                </label>
              </div>
              <label>
                Account type
                <select value={form.type} onChange={(e) => update('type', e.target.value)}>
                  <option value="buyer">Buyer &mdash; I&rsquo;m here to read</option>
                  <option value="seller">Seller — I want to list stories</option>
                </select>
              </label>
              <label>
                Referred by (optional)
                <input
                  value={form.referredBy}
                  onChange={(e) => update('referredBy', e.target.value)}
                  placeholder="a friend's username"
                />
              </label>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <p className="auth-hint">
              Try <code>reader.demo</code> / <code>reader123</code>, or <code>priya.sundaram</code> /{' '}
              <code>seller123</code> for a seller account.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
