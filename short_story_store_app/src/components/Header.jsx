import { useState } from 'react';
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
  onOpenSell,
}) {
  const { theme, toggleTheme, session, currentUser, logout, unreadRecommendations, incomingRequests } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const alerts = unreadRecommendations + incomingRequests.length;
  const type = currentUser?.type;

  function go(v, tab) {
    onNavigate(v, tab);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="wrap glass header-bar">
        <button className="brand brand-btn" onClick={() => go('shop')} aria-label="Cafe Livre home">
          <BrandMark />
          Cafe Livre - A Short Story Store
        </button>
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
            title="Wishlist"
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
            <div className="account-menu">
              <button
                className="icon-btn account-avatar"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={`Account menu${alerts ? `, ${alerts} new` : ''}`}
                aria-expanded={menuOpen}
              >
                {session.slice(0, 1).toUpperCase()}
                {alerts > 0 && <span className="cart-count">{alerts}</span>}
              </button>
              {menuOpen && (
                <div className="account-dropdown glass">
                  <div className="account-name">{currentUser?.displayName || session}</div>
                  <div className="account-type">{type}</div>
                  <button className="dropdown-item" onClick={() => go('shop')}>Browse stories</button>
                  {type !== 'admin' && (
                    <>
                      <button className="dropdown-item" onClick={() => go('account', 'recommended')}>
                        Recommended for me{unreadRecommendations > 0 ? ` (${unreadRecommendations} new)` : ''}
                      </button>
                      <button className="dropdown-item" onClick={() => go('account', 'wishlist')}>Wishlist</button>
                      <button className="dropdown-item" onClick={() => go('account', 'history')}>Purchase history</button>
                      <button className="dropdown-item" onClick={() => go('account', 'friends')}>
                        Friends{incomingRequests.length > 0 ? ` (${incomingRequests.length} request${incomingRequests.length > 1 ? 's' : ''})` : ''}
                      </button>
                    </>
                  )}
                  {type === 'seller' && (
                    <button className="dropdown-item" onClick={() => go('seller')}>Seller dashboard</button>
                  )}
                  {type === 'admin' && (
                    <button className="dropdown-item" onClick={() => go('admin')}>Admin dashboard</button>
                  )}
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      logout();
                      go('shop');
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: '10px 20px', border: 'none' }} onClick={onOpenAuth}>
              Log in
            </button>
          )}
        </div>
      </div>
      {view !== 'shop' && <span className="sr-only" aria-live="polite">{`Viewing ${view}`}</span>}
    </header>
  );
}
