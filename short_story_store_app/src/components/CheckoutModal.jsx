import { useState } from 'react';
import { useApp } from '../state/store';

export default function CheckoutModal({ items, onClose, onSuccess }) {
  const { placeOrder, currentUser } = useApp();
  const [payment, setPayment] = useState('card');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, s) => sum + s.price, 0);

  function submit(e) {
    e.preventDefault();
    setError('');
    const result = placeOrder({ payment, email, address, promoCode });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSuccess(result.order);
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label="Checkout">
        <button className="modal-close" onClick={onClose} aria-label="Close checkout">
          ✕
        </button>
        <h2>Checkout</h2>
        <p className="modal-author">{items.length} {items.length === 1 ? 'story' : 'stories'} · ${subtotal.toFixed(2)} before any offer</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Email for your receipt
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={currentUser ? `${currentUser.username}@example.com` : 'you@example.com'}
            />
          </label>

          <label>Payment method</label>
          <div className="payment-options">
            {[
              { id: 'bkash', label: 'bKash' },
              { id: 'card', label: 'Card' },
              { id: 'cod', label: 'Cash on delivery' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                className={`payment-chip${payment === opt.id ? ' active' : ''}`}
                onClick={() => setPayment(opt.id)}
                aria-pressed={payment === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {payment === 'cod' && (
            <label>
              Delivery address
              <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where should we send a printed copy?" />
            </label>
          )}

          <label>
            Promo code (optional)
            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="WELCOME10" />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="checkout-btn" type="submit">
            Place order
          </button>
        </form>
      </div>
    </div>
  );
}
