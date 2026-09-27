export default function LibraryDrawer({ open, purchases, stories, onClose, onOpenStory }) {
  if (!open) return null;

  const rows = purchases
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => ({ ...p, story: stories.find((s) => s.id === p.storyId) }))
    .filter((r) => r.story);

  return (
    <>
      <div className="drawer-overlay" onMouseDown={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your library">
        <div className="cart-header">
          <h2 style={{ fontSize: '1.3rem' }}>My library</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close library">
            ✕
          </button>
        </div>
        <div className="cart-items">
          {rows.length === 0 && <div className="cart-empty">Nothing purchased yet — your bought stories will land here.</div>}
          {rows.map((r) => (
            <button
              className="cart-item library-item"
              key={`${r.orderId}-${r.storyId}`}
              onClick={() => {
                onOpenStory(r.storyId);
                onClose();
              }}
            >
              <div>
                <div className="cart-item-title">{r.story.title}</div>
                <div className="cart-item-price">Purchased {r.date}</div>
              </div>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
