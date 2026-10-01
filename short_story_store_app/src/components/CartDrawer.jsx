export default function CartDrawer({ open, items, onClose, onRemove, onProceedToCheckout }) {
  if (!open) return null;
  const subtotal = items.reduce((sum, s) => sum + s.price, 0);

  return (
    <>
      <div className="drawer-overlay" onMouseDown={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="cart-header">
          <h2 style={{ fontSize: '1.3rem' }}>Your cart</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>
        <div className="cart-items">
          {items.length === 0 && <div className="cart-empty">Your cart is empty. Go find something short and good.</div>}
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <div className="cart-item-title">{item.title}</div>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
              </div>
              <button className="remove-btn" onClick={() => onRemove(item.id)}>
                remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" disabled={items.length === 0} onClick={onProceedToCheckout}>
            Proceed to checkout
          </button>
        </div>
      </aside>
    </>
  );
}
