import ThemeToggle from './ThemeToggle';
import Icon from './Icons';
import { useApp } from '../state/store';

export default function Header({ cartCount, favCount, onOpenCart, onOpenAuth, onNavigate, view, accountTab, onOpenSell }) {
  const { theme, toggleTheme, session, currentUser, logout, unreadRecommendations, incomingRequests } = useApp();
  const type = currentUser?.type;
  const buyerLinks = session && type !== 'admin';

  // Top-bar links. Cart opens the cart drawer; the rest switch pages.
  const links = [
    { key: 'shop', label: 'Browse', icon: 'store', view: 'shop' },
    { key: 'cart', label: 'Cart', icon: 'cart', action: onOpenCart, badge: cartCount, aria: 'Open cart' },
    { key: 'wishlist', label: 'Wishlist', icon: 'heart', view: 'account', tab: 'wishlist', badge: favCount, needsLogin: true },
  ];
  if (buyerLinks) {
    links.push(
      { key: 'history', label: 'History', icon: 'history', view: 'account', tab: 'history' },
      { key: 'recommended', label: 'Recommended', icon: 'sparkles', view: 'account', tab: 'recommended', badge: unreadRecommendations },
      { key: 'friends', label: 'Friends', icon: 'users', view: 'account', tab: 'friends', badge: incomingRequests.length }
    );
  }
  if (type === 'seller') links.push({ key: 'seller', label: 'Dashboard', icon: 'grid', view: 'seller' });
  if (type === 'admin') links.push({ key: 'admin', label: 'Admin dashboard', icon: 'shield', view: 'admin' });

  const isActive = (l) => !l.action && (l.view === 'account' ? view === 'account' && accountTab === l.tab : view === l.view);

  function click(l) {
    if (l.action) return l.action();
    if (l.needsLogin && !session) return onOpenAuth();
    onNavigate(l.view, l.tab);
  }

  return (
    <header className="site-header">
      <div className="wrap glass header-bar">
        <button className="brand brand-btn" onClick={() => onNavigate('shop')} aria-label="Cafe Livre home">
          <span className="brand-icon"><Icon name="book" size={28} /></span>
          Cafe Livre
        </button>

        <nav className="header-nav" aria-label="Main">
          {links.map((l) => (
            <button
              key={l.key}
              className={`nav-link${isActive(l) ? ' active' : ''}`}
              aria-current={isActive(l) ? 'page' : undefined}
              aria-label={l.aria}
              onClick={() => click(l)}
            >
              <Icon name={l.icon} />
              <span>{l.label}</span>
              {l.badge > 0 && <span className="nav-badge" aria-label={`${l.badge} ${l.key === 'cart' || l.key === 'wishlist' ? 'items' : 'new'}`}>{l.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {(type === 'seller' || type === 'admin') && (
            <button className="btn-ghost sell-btn" onClick={onOpenSell}>
              <Icon name="plus" size={16} /> Sell a story
            </button>
          )}

          {session ? (
            <>
              <span className="role-chip" title={`Signed in as ${currentUser?.displayName || session}`}>
                <Icon name="userCircle" size={20} />
                {type}
              </span>
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  onNavigate('shop');
                }}
              >
                <Icon name="logout" />
                Logout
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
