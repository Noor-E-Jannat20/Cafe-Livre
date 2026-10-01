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
  onOpenLibrary,
  onOpenSell,
}) {
  const { theme, toggleTheme, session, currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="wrap glass header-bar">
        <div className="brand">
          <BrandMark />
          Cafe Livre - A Short Story Store
        </div>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {currentUser && ['seller', 'admin'].includes(currentUser.type) && (
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
              <button className="icon-btn account-avatar" onClick={() => setMenuOpen((v) => !v)} aria-label="Account menu">
                {session.slice(0, 1).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="account-dropdown glass">
                  <div className="account-name">{currentUser?.displayName || session}</div>
                  <div className="account-type">{currentUser?.type}</div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onOpenLibrary();
                      setMenuOpen(false);
                    }}
                  >
                    My library
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
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
    </header>
  );
}
