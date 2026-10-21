import { useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GenreFilter from './components/GenreFilter';
import StoryGrid from './components/StoryGrid';
import StoryModal from './components/StoryModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import SellModal from './components/SellModal';
import RecommendModal from './components/RecommendModal';
import AccountPage from './components/AccountPage';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { average } from './components/RatingStars';
import { genres as baseGenres } from './data/stories';
import { useApp } from './state/store';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'selling', label: 'Best selling' },
  { id: 'rating', label: 'Top rated' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
];

export default function App() {
  const { stories, shelfStories, wishlist, cart, ratings, offers, toggleWishlist, toggleCart, removeFromCart, moveToWishlist, toast, session, currentUser } =
    useApp();

  const [view, setView] = useState('shop');
  const [accountTab, setAccountTab] = useState('recommended');
  const [activeGenre, setActiveGenre] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [openStoryId, setOpenStoryId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellState, setSellState] = useState(null); // null | { story?: story }
  const [recommendId, setRecommendId] = useState(null);
  const shelfRef = useRef(null);

  const role = currentUser?.type;
  let activeView = view;
  if (view === 'account' && (!session || role === 'admin')) activeView = 'shop';
  if (view === 'seller' && role !== 'seller') activeView = 'shop';
  if (view === 'admin' && role !== 'admin') activeView = 'shop';

  const genres = useMemo(() => ['All', ...Array.from(new Set(shelfStories.map((s) => s.genre)))], [shelfStories]);

  function navigate(v, tab) {
    setView(v);
    if (tab) setAccountTab(tab);
    if (v !== 'shop') setShowFavoritesOnly(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToShelf() {
    shelfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleToggleFavoritesOnly() {
    if (!session) return setAuthOpen(true);
    setView('shop');
    setShowFavoritesOnly((v) => !v);
  }

  function handleOpenCart() {
    if (!session) return setAuthOpen(true);
    setCartOpen(true);
  }

  function handleRecommend(id) {
    if (!session) return setAuthOpen(true);
    setRecommendId(id);
  }

  const visibleStories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = shelfStories.filter((s) => {
      if (activeGenre !== 'All' && s.genre !== activeGenre) return false;
      if (showFavoritesOnly && !wishlist.includes(s.id)) return false;
      if (q && !`${s.title} ${s.author} ${s.sellerId} ${s.blurb}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const by = {
      selling: (a, b) => b.saleCount - a.saleCount,
      rating: (a, b) => (average(ratings[b.id]) || 0) - (average(ratings[a.id]) || 0),
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
    }[sort];
    return by ? [...list].sort(by) : list;
  }, [shelfStories, activeGenre, showFavoritesOnly, wishlist, query, sort, ratings]);

  const openStory = stories.find((s) => s.id === openStoryId) || null;
  const recommendStory = stories.find((s) => s.id === recommendId) || null;
  const cartItems = cart.map((id) => stories.find((s) => s.id === id)).filter(Boolean);
  const activeOffers = offers.filter((o) => new Date(o.validUntil) >= new Date());

  return (
    <>
      <Header
        cartCount={cart.length}
        onOpenCart={handleOpenCart}
        favCount={wishlist.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={handleToggleFavoritesOnly}
        onOpenAuth={() => setAuthOpen(true)}
        onNavigate={navigate}
        view={activeView}
        onOpenSell={() => setSellState({})}
      />

      <main>
        {activeView === 'shop' && (
          <>
            <Hero storyCount={shelfStories.length} onBrowse={scrollToShelf} />

            {activeOffers.length > 0 && (
              <div className="wrap">
                <div className="offer-banner glass">
                  🏷️ {activeOffers.map((o) => `${o.code} — ${o.description}`).join('   ·   ')}
                </div>
              </div>
            )}

            <section className="section" ref={shelfRef}>
              <div className="wrap">
                <div className="section-head">
                  <h2>{showFavoritesOnly ? 'Your wishlist' : 'Browse the shelf'}</h2>
                  <p>{visibleStories.length} of {shelfStories.length} stories</p>
                </div>
                <div className="browse-tools">
                  <label className="search-field">
                    <span className="sr-only">Search stories</span>
                    <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author or keyword" />
                  </label>
                  <label className="sort-field">
                    <span>Sort</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      {SORTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <GenreFilter genres={genres.length > 1 ? genres : baseGenres} active={activeGenre} onSelect={setActiveGenre} />
                <StoryGrid
                  stories={visibleStories}
                  favorites={wishlist}
                  cart={cart}
                  ratings={ratings}
                  onOpen={setOpenStoryId}
                  onToggleFav={toggleWishlist}
                  onToggleCart={toggleCart}
                />
              </div>
            </section>
          </>
        )}

        {activeView === 'account' && (
          <AccountPage
            tab={accountTab}
            onTab={setAccountTab}
            onOpenStory={setOpenStoryId}
            onRecommend={handleRecommend}
            onBrowse={() => navigate('shop')}
          />
        )}

        {activeView === 'seller' && (
          <SellerDashboard onSell={() => setSellState({})} onEdit={(story) => setSellState({ story })} onOpenStory={setOpenStoryId} />
        )}

        {activeView === 'admin' && <AdminDashboard onEdit={(story) => setSellState({ story })} onOpenStory={setOpenStoryId} />}
      </main>

      <Footer />

      {openStory && (
        <StoryModal
          story={openStory}
          isFav={wishlist.includes(openStory.id)}
          inCart={cart.includes(openStory.id)}
          onClose={() => setOpenStoryId(null)}
          onToggleFav={toggleWishlist}
          onToggleCart={toggleCart}
          onOpenStory={setOpenStoryId}
          onRecommend={handleRecommend}
        />
      )}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onSaveForLater={moveToWishlist}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {checkoutOpen && (
        <CheckoutModal
          items={cartItems}
          onClose={() => setCheckoutOpen(false)}
          onViewHistory={() => {
            setCheckoutOpen(false);
            navigate('account', 'history');
          }}
        />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {sellState && <SellModal story={sellState.story} onClose={() => setSellState(null)} />}
      {recommendStory && (
        <RecommendModal
          story={recommendStory}
          onClose={() => setRecommendId(null)}
          onGoFriends={() => {
            setRecommendId(null);
            setOpenStoryId(null);
            navigate('account', 'friends');
          }}
        />
      )}

      {toast && <div className="toast glass" role="status">{toast}</div>}
    </>
  );
}
