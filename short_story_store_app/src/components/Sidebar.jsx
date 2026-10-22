import Icon from './Icons';
import { useApp } from '../state/store';

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  onCloseMobile,
  cartCount,
  favCount,
  onOpenCart,
  onOpenAuth,
  onNavigate,
  view,
  accountTab,
  onOpenSell,
}) {
  const { theme, toggleTheme, session, currentUser, logout, unreadRecommendations, incomingRequests } = useApp();
  const type = currentUser?.type;
  const buyerLinks = session && type !== 'admin';

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

  function go(l) {
    onCloseMobile();
    if (l.action) return l.action();
    if (l.needsLogin && !session) return onOpenAuth();
    onNavigate(l.view, l.tab);
  }

  const night = theme === 'night';

  return (
    <aside className="sidebar glass" aria-label="Sidebar">
      <div className="side-top">
        <button className="side-brand" onClick={() => { onCloseMobile(); onNavigate('shop'); }} aria-label="Cafe Livre home">
          <span className="side-brand-icon"><Icon name="book" size={26} /></span>
          <span className="side-label side-brand-text">Cafe Livre</span>
        </button>
        <button
          className="side-collapse"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={16} />
        </button>
        <button className="side-close" onClick={onCloseMobile} aria-label="Close menu">
          <Icon name="close" size={18} />
        </button>
      </div>

      {session ? (
        <div className="side-profile" title={`${currentUser?.displayName || session} (${type})`}>
          <span className="side-avatar"><Icon name="userCircle" size={24} /></span>
          <span className="side-who side-label">
            <span className="side-name">{currentUser?.displayName || session}</span>
            <span className="side-handle">@{session} · {type}</span>
          </span>
        </div>
      ) : (
        <div className="side-profile">
          <button className="side-avatar side-avatar-btn" onClick={() => { onCloseMobile(); onOpenAuth(); }} aria-label="Log in" title="Log in">
            <Icon name="userCircle" size={24} />
          </button>
          <span className="side-who side-label">
            <span className="side-name">Welcome</span>
            <button className="side-login" onClick={() => { onCloseMobile(); onOpenAuth(); }}>Log in or sign up</button>
          </span>
        </div>
      )}

      <nav className="side-nav" aria-label="Main">
        {links.map((l) => (
          <button
            key={l.key}
            className={`side-link${isActive(l) ? ' active' : ''}`}
            aria-current={isActive(l) ? 'page' : undefined}
            aria-label={l.aria || l.label}
            title={collapsed ? l.label : undefined}
            onClick={() => go(l)}
          >
            <Icon name={l.icon} size={22} />
            <span className="side-label">{l.label}</span>
            {l.badge > 0 && <span className="side-badge" aria-label={`${l.badge} ${l.key === 'cart' || l.key === 'wishlist' ? 'items' : 'new'}`}>{l.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="side-bottom">
        {(type === 'seller' || type === 'admin') && (
          <button className="side-link" onClick={() => { onCloseMobile(); onOpenSell(); }} title={collapsed ? 'Sell a story' : undefined} aria-label="Sell a story">
            <Icon name="plus" size={22} />
            <span className="side-label">Sell a story</span>
          </button>
        )}
        <button
          className="side-link"
          onClick={toggleTheme}
          aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
          title={collapsed ? (night ? 'Day mode' : 'Night mode') : undefined}
        >
          <Icon name={night ? 'sun' : 'moon'} size={22} />
          <span className="side-label">{night ? 'Day mode' : 'Night mode'}</span>
        </button>
        {session && (
          <button
            className="side-link logout"
            onClick={() => {
              onCloseMobile();
              logout();
              onNavigate('shop');
            }}
            aria-label="Log out"
            title={collapsed ? 'Log out' : undefined}
          >
            <Icon name="logout" size={22} />
            <span className="side-label">Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
