import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { stories as seedStories } from '../data/stories';
import { seedUsers } from '../data/users';
import { seedOffers } from '../data/offers';
import { seedRatings, seedResponses } from '../data/seedActivity';

const STORAGE_KEY = 'loose-leaf-state-v2';
const AppCtx = createContext(null);

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppProvider({ children }) {
  const saved = useMemo(loadSaved, []);

  const [theme, setTheme] = useState(saved.theme || 'day');
  const [users, setUsers] = useState(saved.users || seedUsers);
  const [session, setSession] = useState(saved.session || null);
  const [stories, setStories] = useState(saved.stories || seedStories);
  const [wishlist, setWishlist] = useState(saved.wishlist || {});
  const [cart, setCart] = useState(saved.cart || {});
  const [ratings, setRatings] = useState(saved.ratings || seedRatings);
  const [responses, setResponses] = useState(saved.responses || seedResponses);
  const [orders, setOrders] = useState(saved.orders || []);
  const [purchases, setPurchases] = useState(saved.purchases || []);
  const [offers] = useState(saved.offers || seedOffers);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme, users, session, stories, wishlist, cart, ratings, responses, orders, purchases, offers })
    );
  }, [theme, users, session, stories, wishlist, cart, ratings, responses, orders, purchases, offers]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const currentUser = users.find((u) => u.username === session) || null;

  function login(username, password) {
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) return { ok: false, message: 'No account matches that username and password.' };
    setSession(username);
    notify(`Welcome back, ${user.displayName || user.username} ☕`);
    return { ok: true };
  }

  function signup({ username, password, dob, phone, type, referredBy }) {
    if (!username || !password) return { ok: false, message: 'Username and password are required.' };
    if (users.some((u) => u.username === username)) {
      return { ok: false, message: 'That username is already taken.' };
    }
    if (referredBy && !users.some((u) => u.username === referredBy)) {
      return { ok: false, message: 'That referrer username was not found.' };
    }
    const newUser = {
      username,
      password,
      dob: dob || null,
      dateOfCreation: new Date().toISOString().slice(0, 10),
      type: type || 'buyer',
      phone: phone || null,
      displayName: username,
      referredBy: referredBy || null,
    };
    setUsers((prev) => [...prev, newUser]);
    setSession(username);
    notify(`Account created. Welcome to Loose Leaf, ${username}!`);
    return { ok: true };
  }

  function logout() {
    setSession(null);
    notify('Logged out. Your shelf will be here when you get back.');
  }

  function requireAuth() {
    if (!session) {
      notify('Log in to do that.');
      return false;
    }
    return true;
  }

  function toggleWishlist(storyId) {
    if (!requireAuth()) return;
    setWishlist((prev) => {
      const mine = prev[session] || [];
      const next = mine.includes(storyId) ? mine.filter((id) => id !== storyId) : [...mine, storyId];
      return { ...prev, [session]: next };
    });
  }

  function toggleCart(storyId) {
    if (!requireAuth()) return;
    setCart((prev) => {
      const mine = prev[session] || [];
      if (mine.includes(storyId)) {
        return { ...prev, [session]: mine.filter((id) => id !== storyId) };
      }
      notify('Added to cart ☕');
      return { ...prev, [session]: [...mine, storyId] };
    });
  }

  function removeFromCart(storyId) {
    if (!session) return;
    setCart((prev) => ({ ...prev, [session]: (prev[session] || []).filter((id) => id !== storyId) }));
  }

  function rateStory(storyId, value) {
    if (!requireAuth()) return;
    setRatings((prev) => ({
      ...prev,
      [storyId]: { ...(prev[storyId] || {}), [session]: value },
    }));
    notify('Thanks for rating!');
  }

  function addResponse(storyId, text) {
    if (!requireAuth()) return;
    if (!text.trim()) return;
    setResponses((prev) => ({
      ...prev,
      [storyId]: [
        ...(prev[storyId] || []),
        { username: session, responses: text.trim(), date: new Date().toISOString().slice(0, 10) },
      ],
    }));
  }

  function findOffer(code) {
    const offer = offers.find((o) => o.code.toLowerCase() === (code || '').trim().toLowerCase());
    if (!offer) return { ok: false, message: 'That code doesn\u2019t match any offer.' };
    if (new Date(offer.validUntil) < new Date()) return { ok: false, message: 'That offer has expired.' };
    return { ok: true, offer };
  }

  function placeOrder({ payment, email, address, promoCode }) {
    if (!session) return { ok: false, message: 'Log in first.' };
    const items = (cart[session] || []).map((id) => stories.find((s) => s.id === id)).filter(Boolean);
    if (items.length === 0) return { ok: false, message: 'Your cart is empty.' };

    let subtotal = items.reduce((sum, s) => sum + s.price, 0);
    let appliedOffer = null;
    if (promoCode) {
      const result = findOffer(promoCode);
      if (!result.ok) return result;
      appliedOffer = result.offer;
      subtotal = appliedOffer.percent
        ? subtotal * (1 - appliedOffer.percent)
        : Math.max(0, subtotal - appliedOffer.amount);
    }

    const orderId = genId('order');
    const date = new Date().toISOString().slice(0, 10);

    const order = {
      id: orderId,
      username: session,
      timePlaced: new Date().toISOString(),
      payment,
      email,
      address: payment === 'cod' ? address : address || null,
      promoCode: appliedOffer ? appliedOffer.code : null,
      total: Number(subtotal.toFixed(2)),
      storyIds: items.map((s) => s.id),
    };

    setOrders((prev) => [...prev, order]);
    setPurchases((prev) => [
      ...prev,
      ...items.map((s) => ({ username: session, storyId: s.id, date, orderId })),
    ]);
    setStories((prev) =>
      prev.map((s) => (order.storyIds.includes(s.id) ? { ...s, saleCount: s.saleCount + 1 } : s))
    );
    setCart((prev) => ({ ...prev, [session]: [] }));
    notify('Order brewed! Your stories are on their way ✨');
    return { ok: true, order };
  }

  function addStory({ name, description, genre, price, accent }) {
    if (!session || !['seller', 'admin'].includes(currentUser?.type)) {
      return { ok: false, message: 'Only seller accounts can list a story.' };
    }
    if (!name || !description || !price) return { ok: false, message: 'Title, description and price are required.' };
    const story = {
      id: genId('story'),
      title: name,
      sellerId: session,
      author: currentUser.displayName || session,
      genre: genre || 'Slice of Life',
      accent: accent || 'sky',
      minutes: Math.max(2, Math.round(description.split(' ').length / 180)),
      price: Number(price),
      saleCount: 0,
      blurb: description.slice(0, 160),
      text: description,
    };
    setStories((prev) => [story, ...prev]);
    notify('Your story is on the shelf!');
    return { ok: true, story };
  }

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'day' ? 'night' : 'day')),
    users,
    session,
    currentUser,
    stories,
    genresSource: stories,
    wishlist: session ? wishlist[session] || [] : [],
    cart: session ? cart[session] || [] : [],
    ratings,
    responses,
    orders,
    purchases: session ? purchases.filter((p) => p.username === session) : [],
    offers,
    toast,
    notify,
    login,
    signup,
    logout,
    toggleWishlist,
    toggleCart,
    removeFromCart,
    rateStory,
    addResponse,
    findOffer,
    placeOrder,
    addStory,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
