import { useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GenreFilter from './components/GenreFilter';
import StoryGrid from './components/StoryGrid';
import StoryModal from './components/StoryModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import LibraryDrawer from './components/LibraryDrawer';
import AuthModal from './components/AuthModal';
import SellModal from './components/SellModal';
import Footer from './components/Footer';
import { genres as baseGenres } from './data/stories';
import { useApp } from './state/store';

export default function App() {
  const { stories, wishlist, cart, ratings, purchases, offers, toggleWishlist, toggleCart, removeFromCart, toast, session } =
    useApp();

  const [activeGenre, setActiveGenre] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [openStoryId, setOpenStoryId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const shelfRef = useRef(null);

  const genres = useMemo(() => ['All', ...Array.from(new Set(stories.map((s) => s.genre)))], [stories]);

  function scrollToShelf() {
    shelfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleToggleFavoritesOnly() {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    setShowFavoritesOnly((v) => !v);
  }

  function handleOpenCart() {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    setCartOpen(true);
  }

  const visibleStories = stories.filter((s) => {
    if (activeGenre !== 'All' && s.genre !== activeGenre) return false;
    if (showFavoritesOnly && !wishlist.includes(s.id)) return false;
    return true;
  });

  const openStory = stories.find((s) => s.id === openStoryId) || null;
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
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenSell={() => setSellOpen(true)}
      />

      <main>
        <Hero storyCount={stories.length} onBrowse={scrollToShelf} />

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
              <h2>{showFavoritesOnly ? 'Your wishlist' : 'The shelf'}</h2>
              <p>
                {visibleStories.length} of {stories.length} stories
              </p>
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
        />
      )}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {checkoutOpen && (
        <CheckoutModal
          items={cartItems}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => setCheckoutOpen(false)}
        />
      )}

      <LibraryDrawer
        open={libraryOpen}
        purchases={purchases}
        stories={stories}
        onClose={() => setLibraryOpen(false)}
        onOpenStory={(id) => setOpenStoryId(id)}
      />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {sellOpen && <SellModal onClose={() => setSellOpen(false)} />}

      {toast && <div className="toast glass">{toast}</div>}
    </>
  );
}
