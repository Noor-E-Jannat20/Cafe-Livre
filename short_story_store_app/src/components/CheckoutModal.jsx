import { useState } from 'react';
import { useApp } from '../state/store';

const METHODS = [
  { id: 'card', label: 'Card' },
  { id: 'bkash', label: 'bKash' },
  { id: 'cod', label: 'Cash on delivery' },
];

function luhn(num) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function validateBilling(b) {
  const e = {};
  if (!b.fullName.trim()) e.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(b.email)) e.email = 'Enter a valid email for your receipt.';
  if (b.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number.';
  if (!b.address.trim()) e.address = 'Enter your billing address.';
  if (!b.city.trim()) e.city = 'Enter your city.';
  if (!b.country.trim()) e.country = 'Enter your country.';
  return e;
}

function validatePayment(method, p) {
  const e = {};
  if (method === 'card') {
    const digits = p.cardNumber.replace(/\s/g, '');
    if (!p.cardName.trim()) e.cardName = 'Enter the name on the card.';
    if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) e.cardNumber = 'That card number doesn’t look right.';
    const m = p.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.expiry = 'Use MM/YY.';
    else {
      const now = new Date();
      const exp = new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59);
      if (exp < now) e.expiry = 'This card has expired.';
    }
    if (!/^\d{3,4}$/.test(p.cvc)) e.cvc = '3 or 4 digits.';
  }
  if (method === 'bkash') {
    if (!/^01\d{9}$/.test(p.bkashNumber.replace(/\s|-/g, ''))) e.bkashNumber = 'Use an 11-digit number starting with 01.';
    if (!/^[A-Za-z0-9]{6,}$/.test(p.bkashTxn.trim())) e.bkashTxn = 'Enter the transaction ID from bKash (6+ characters).';
  }
  return e;
}

function paymentLabel(method, p) {
  if (method === 'card') return `Card ending ${p.cardNumber.replace(/\s/g, '').slice(-4)}`;
  if (method === 'bkash') {
    const n = p.bkashNumber.replace(/\s|-/g, '');
    return `bKash ${n.slice(0, 3)}•••••${n.slice(-3)}`;
  }
  return 'Cash on delivery';
}

function Field({ label, error, children }) {
  return (
    <label className={error ? 'has-error' : undefined}>
      {label}
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}

export default function CheckoutModal({ items, onClose, onViewHistory }) {
  const { placeOrder, currentUser, myOrders, findOffer, priceWithOffer } = useApp();
  const last = myOrders[myOrders.length - 1]?.billing;

  const [step, setStep] = useState(1);
  const [billing, setBilling] = useState(
    last || { fullName: currentUser?.displayName || '', email: '', phone: currentUser?.phone || '', address: '', city: '', postalCode: '', country: '' }
  );
  const [method, setMethod] = useState('card');
  const [pay, setPay] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '', bkashNumber: '', bkashTxn: '' });
  const [promoCode, setPromoCode] = useState('');
  const [offer, setOffer] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [done, setDone] = useState(null);

  const subtotal = items.reduce((sum, s) => sum + s.price, 0);
  const total = priceWithOffer(subtotal, offer);
  const setB = (k, v) => setBilling((b) => ({ ...b, [k]: v }));
  const setP = (k, v) => setPay((p) => ({ ...p, [k]: v }));

  function applyPromo() {
    setPromoMsg('');
    if (!promoCode.trim()) {
      setOffer(null);
      return;
    }
    const r = findOffer(promoCode);
    if (!r.ok) {
      setOffer(null);
      setPromoMsg(r.message);
    } else {
      setOffer(r.offer);
      setPromoMsg(`${r.offer.code} applied: ${r.offer.description}`);
    }
  }

  function next(e) {
    e.preventDefault();
    const errs = step === 1 ? validateBilling(billing) : validatePayment(method, pay);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  }

  function place() {
    setFormError('');
    const result = placeOrder({
      billing,
      payment: { method, label: paymentLabel(method, pay) },
      promoCode: offer ? offer.code : promoCode,
    });
    if (!result.ok) return setFormError(result.message);
    setDone(result.order);
  }

  const steps = ['Billing', 'Payment', 'Review'];

  if (done) {
    return (
      <div className="modal-overlay">
        <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label="Order confirmed">
          <h2>Order confirmed ✨</h2>
          <p className="modal-author">Receipt sent to {done.billing.email}</p>
          <div className="order-lines">
            {done.items.map((i) => (
              <div key={i.storyId}><span>{i.title}</span><span>${i.price.toFixed(2)}</span></div>
            ))}
            {done.promoCode && <div><span>Offer {done.promoCode}</span><span>−${(done.subtotal - done.total).toFixed(2)}</span></div>}
            <div className="order-total"><span>Total</span><span>${done.total.toFixed(2)}</span></div>
          </div>
          <p className="auth-hint">Paid with {done.payment.label}. Your stories are in your purchase history.</p>
          <div className="modal-actions">
            <button className="btn-primary" style={{ border: 'none' }} onClick={onViewHistory}>View purchase history</button>
            <button className="btn-ghost" onClick={onClose}>Keep browsing</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel glass" role="dialog" aria-modal="true" aria-label="Checkout">
        <button className="modal-close" onClick={onClose} aria-label="Close checkout">✕</button>
        <h2>Checkout</h2>
        <ol className="checkout-steps" aria-label="Checkout steps">
          {steps.map((label, i) => (
            <li key={label} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''} aria-current={step === i + 1 ? 'step' : undefined}>
              {label}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <form className="auth-form" onSubmit={next} noValidate>
            <Field label="Full name" error={errors.fullName}>
              <input value={billing.fullName} onChange={(e) => setB('fullName', e.target.value)} autoComplete="name" />
            </Field>
            <div className="auth-row">
              <Field label="Email for your receipt" error={errors.email}>
                <input type="email" value={billing.email} onChange={(e) => setB('email', e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input value={billing.phone} onChange={(e) => setB('phone', e.target.value)} autoComplete="tel" />
              </Field>
            </div>
            <Field label="Billing address" error={errors.address}>
              <input value={billing.address} onChange={(e) => setB('address', e.target.value)} autoComplete="street-address" />
            </Field>
            <div className="auth-row">
              <Field label="City" error={errors.city}>
                <input value={billing.city} onChange={(e) => setB('city', e.target.value)} autoComplete="address-level2" />
              </Field>
              <Field label="Postal code (optional)">
                <input value={billing.postalCode} onChange={(e) => setB('postalCode', e.target.value)} autoComplete="postal-code" />
              </Field>
            </div>
            <Field label="Country" error={errors.country}>
              <input value={billing.country} onChange={(e) => setB('country', e.target.value)} autoComplete="country-name" />
            </Field>
            <button className="checkout-btn" type="submit">Continue to payment</button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={next} noValidate>
            <span className="cover-upload-label">Payment method</span>
            <div className="payment-options">
              {METHODS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  className={`payment-chip${method === opt.id ? ' active' : ''}`}
                  onClick={() => {
                    setMethod(opt.id);
                    setErrors({});
                  }}
                  aria-pressed={method === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {method === 'card' && (
              <>
                <Field label="Name on card" error={errors.cardName}>
                  <input value={pay.cardName} onChange={(e) => setP('cardName', e.target.value)} autoComplete="cc-name" />
                </Field>
                <Field label="Card number" error={errors.cardNumber}>
                  <input
                    inputMode="numeric"
                    value={pay.cardNumber}
                    onChange={(e) => setP('cardNumber', e.target.value.replace(/[^\d ]/g, '').slice(0, 23))}
                    placeholder="4242 4242 4242 4242"
                    autoComplete="cc-number"
                  />
                </Field>
                <div className="auth-row">
                  <Field label="Expiry (MM/YY)" error={errors.expiry}>
                    <input value={pay.expiry} onChange={(e) => setP('expiry', e.target.value.slice(0, 5))} placeholder="08/29" autoComplete="cc-exp" />
                  </Field>
                  <Field label="CVC" error={errors.cvc}>
                    <input inputMode="numeric" value={pay.cvc} onChange={(e) => setP('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} autoComplete="cc-csc" />
                  </Field>
                </div>
              </>
            )}

            {method === 'bkash' && (
              <>
                <Field label="bKash number" error={errors.bkashNumber}>
                  <input inputMode="numeric" value={pay.bkashNumber} onChange={(e) => setP('bkashNumber', e.target.value)} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Transaction ID" error={errors.bkashTxn}>
                  <input value={pay.bkashTxn} onChange={(e) => setP('bkashTxn', e.target.value)} placeholder="From your bKash confirmation" />
                </Field>
              </>
            )}

            {method === 'cod' && (
              <p className="auth-hint">You’ll pay when your printed copy arrives at {billing.address || 'your billing address'}.</p>
            )}

            <p className="auth-hint">Demo checkout: nothing is charged, and card numbers and CVCs are never saved.</p>
            <div className="modal-actions">
              <button className="btn-ghost" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="checkout-btn" type="submit" style={{ flex: 1 }}>Review order</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="auth-form">
            <div className="order-lines">
              {items.map((i) => (
                <div key={i.id}><span>{i.title}</span><span>${i.price.toFixed(2)}</span></div>
              ))}
              {offer && <div><span>Offer {offer.code}</span><span>−${(subtotal - total).toFixed(2)}</span></div>}
              <div className="order-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <div className="promo-row">
              <label>
                Promo code (optional)
                <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="WELCOME10" />
              </label>
              <button type="button" className="btn-ghost" onClick={applyPromo}>Apply</button>
            </div>
            {promoMsg && <p className={offer ? 'auth-hint' : 'auth-error'} role="status">{promoMsg}</p>}

            <div className="review-box">
              <div><b>Billing</b> <button type="button" className="remove-btn" onClick={() => setStep(1)}>edit</button></div>
              <p>{billing.fullName}<br />{billing.address}, {billing.city}{billing.postalCode ? ` ${billing.postalCode}` : ''}, {billing.country}<br />{billing.email} · {billing.phone}</p>
              <div><b>Payment</b> <button type="button" className="remove-btn" onClick={() => setStep(2)}>edit</button></div>
              <p>{paymentLabel(method, pay)}</p>
            </div>

            {formError && <p className="auth-error" role="alert">{formError}</p>}
            <div className="modal-actions">
              <button className="btn-ghost" type="button" onClick={() => setStep(2)}>Back</button>
              <button className="checkout-btn" type="button" style={{ flex: 1 }} onClick={place}>Place order · ${total.toFixed(2)}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
