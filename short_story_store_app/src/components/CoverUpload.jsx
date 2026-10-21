import { useState } from 'react';
import { fileToCover } from '../utils/image';

export default function CoverUpload({ value, onChange, required }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await fileToCover(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cover-upload">
      <span className="cover-upload-label">Cover art{required ? '' : ' (optional)'}</span>
      <div className="cover-upload-row">
        <div className="cover-preview">
          {value ? <img src={value} alt="Cover preview" /> : <span>No cover yet</span>}
        </div>
        <div className="cover-upload-actions">
          <label
            className="btn-ghost cover-pick"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            {busy ? 'Processing…' : value ? 'Replace image' : 'Upload image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {value && (
            <button type="button" className="remove-btn" onClick={() => onChange('')}>
              remove
            </button>
          )}
          <p className="auth-hint">JPG, PNG or WebP. Portrait (3:4) looks best. We resize it for you.</p>
        </div>
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </div>
  );
}
