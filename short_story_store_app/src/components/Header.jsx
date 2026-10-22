import ThemeToggle from './ThemeToggle';
import BrandMark from './BrandMark';
import { useApp } from '../state/store';

export default function Header({
  cartCount,
  onOpenCart,
  favCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenAuth,
  onNavigate,
  view,
  accountTab,
  onOpenSell,
}) {
  const { theme, toggleTheme, session, currentUser, logout, unreadRecommendations, incomingRequests } = useApp();
  const type = currentUser?.type;

  // Links shown in the top bar, by role. `badge` is a small count for things needing attention.
  const links = [{ key: 'shop', label: 'Browse', view: 'shop' }];
  if (session && type !== 'admin') {
    links.push(
      { key: 'recommended', label: 'Recommended', view: 'account', tab: 'recommended', badge: unreadRecommendations },
      { key: 'wishlist', label: 'Wishlist', view: 'account', tab: 'wishlist' },
      { key: 'history', label: 'History', view: 'account', tab: 'history' },
      { key: 'friends', label: 'Friends', view: 'account', tab: 'friends', badge: incomingRequests.length }
    );
  }
  if (type === 'seller') links.push({ key: 'seller', label: 'Dashboard', view: 'seller' });
  if (type === 'admin') links.push({ key: 'admin', label: 'Admin dashboard', view: 'admin' });

  const isActive = (l) => (l.view === 'account' ? view === 'account' && accountTab === l.tab : view === l.view);

  return (
    <header className="site-header">
      <div className="wrap glass header-bar">
        <button className="brand brand-btn" onClick={() => onNavigate('shop')} aria-label="Cafe Livre home">
          <BrandMark />
          Cafe Livre - A Short Story Store
        </button>

        <nav className="header-nav" aria-label="Main">
          {links.map((l) => (
            <button
              key={l.key}
              className={`nav-link${isActive(l) ? ' active' : ''}`}
              aria-current={isActive(l) ? 'page' : undefined}
              onClick={() => onNavigate(l.view, l.tab)}
            >
              {l.label}
              {l.badge > 0 && <span className="nav-badge" aria-label={`${l.badge} new`}>{l.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {(type === 'seller' || type === 'admin') && (
            <button className="btn-ghost sell-btn" onClick={onOpenSell}>
              + Sell a story
            </button>
          )}

          <button
            className="icon-btn"
            aria-pressed={showFavoritesOnly}
            aria-label={`${favCount} wishlist items, ${showFavoritesOnly ? 'showing wishlist only' : 'show wishlist only'}`}
            title="Filter shelf by wishlist"
            onClick={onToggleFavoritesOnly}
            style={showFavoritesOnly ? { boxShadow: '0 0 0 3px rgba(255,157,187,0.5)' } : undefined}
          >
            {showFavoritesOnly ? '♥' : '♡'}
            {favCount > 0 && <span className="cart-count">{favCount}</span>}
          </button>

          <button className="icon-btn" onClick={onOpenCart} aria-label="Open cart" title="Cart">
            🛍️
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {session ? (
            <>
              <span className="user-chip" title={`Signed in as ${currentUser?.displayName || session} (${type})`}>
                <span className="account-avatar-dot">{session.slice(0, 1).toUpperCase()}</span>
                <span className="user-chip-text">
                  {currentUser?.displayName || session}
                  <small>{type}</small>
                </span>
              </span>
              <button
                className="btn-ghost nav-logout"
                onClick={() => {
                  logout();
                  onNavigate('shop');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <button className="btn-primary" style={{ padding: '10px 20px', border: 'none' }} onClick={onOpenAuth}>
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
