import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { stories as seedStories } from '../data/stories';
import { seedUsers } from '../data/users';
import { seedOffers } from '../data/offers';
import { seedRatings, seedResponses, seedFriends, seedFriendRequests, seedRecommendations } from '../data/seedActivity';

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

const today = () => new Date().toISOString().slice(0, 10);

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
  const [friends, setFriends] = useState(saved.friends || seedFriends);
  const [friendRequests, setFriendRequests] = useState(saved.friendRequests || seedFriendRequests);
  const [recommendations, setRecommendations] = useState(saved.recommendations || seedRecommendations);
  const [offers] = useState(saved.offers || seedOffers);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme, users, session, stories, wishlist, cart, ratings, responses,
          orders, purchases, friends, friendRequests, recommendations, offers,
        })
      );
    } catch {
      notify('Browser storage is full, so recent changes may not be saved. Try smaller cover images.');
    }
  }, [theme, users, session, stories, wishlist, cart, ratings, responses, orders, purchases, friends, friendRequests, recommendations, offers, notify]);

  const currentUser = users.find((u) => u.username === session) || null;
  const isAdmin = currentUser?.type === 'admin';

  // Sign out if the account was deleted or suspended while signed in.
  useEffect(() => {
    if (session && (!currentUser || currentUser.status === 'suspended')) setSession(null);
  }, [session, currentUser]);

  const suspendedNames = useMemo(
    () => new Set(users.filter((u) => u.status === 'suspended').map((u) => u.username)),
    [users]
  );
  // What buyers can browse: not unlisted, and not from a suspended seller.
  const shelfStories = useMemo(
    () => stories.filter((s) => s.status !== 'hidden' && !suspendedNames.has(s.sellerId)),
    [stories, suspendedNames]
  );

  const ownedIds = useMemo(
    () => (session ? purchases.filter((p) => p.username === session).map((p) => p.storyId) : []),
    [purchases, session]
  );

  /* ---------- auth ---------- */
  function login(username, password) {
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) return { ok: false, message: 'No account matches that username and password.' };
    if (user.status === 'suspended') return { ok: false, message: 'This account is suspended. Contact an admin to reactivate it.' };
    setSession(username);
    notify(`Welcome back, ${user.displayName || user.username} ☕`);
    return { ok: true };
  }

  function signup({ username, password, dob, phone, type, referredBy }) {
    username = (username || '').trim();
    if (!username || !password) return { ok: false, message: 'Username and password are required.' };
    if (users.some((u) => u.username === username)) return { ok: false, message: 'That username is already taken.' };
    if (referredBy && !users.some((u) => u.username === referredBy)) {
      return { ok: false, message: 'That referrer username was not found.' };
    }
    const newUser = {
      username,
      password,
      dob: dob || null,
      dateOfCreation: today(),
      type: type === 'seller' ? 'seller' : 'buyer',
      phone: phone || null,
      displayName: username,
      referredBy: referredBy || null,
      status: 'active',
    };
    setUsers((prev) => [...prev, newUser]);
    if (referredBy) {
      setFriends((prev) => ({
        ...prev,
        [username]: [referredBy],
        [referredBy]: [...(prev[referredBy] || []), username],
      }));
    }
    setSession(username);
    notify(`Account created. Welcome to Cafe Livre, ${username}!`);
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

  /* ---------- wishlist and cart ---------- */
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
    const story = stories.find((s) => s.id === storyId);
    if (story?.sellerId === session) return notify('You can’t buy your own story.');
    if (ownedIds.includes(storyId)) return notify('You already own this story. Find it in your purchase history.');
    setCart((prev) => {
      const mine = prev[session] || [];
      if (mine.includes(storyId)) return { ...prev, [session]: mine.filter((id) => id !== storyId) };
      return { ...prev, [session]: [...mine, storyId] };
    });
    if (!(cart[session] || []).includes(storyId)) notify('Added to cart ☕');
  }

  function removeFromCart(storyId) {
    if (!session) return;
    setCart((prev) => ({ ...prev, [session]: (prev[session] || []).filter((id) => id !== storyId) }));
  }

  function moveToWishlist(storyId) {
    removeFromCart(storyId);
    setWishlist((prev) => {
      const mine = prev[session] || [];
      return mine.includes(storyId) ? prev : { ...prev, [session]: [...mine, storyId] };
    });
    notify('Saved to your wishlist ♥');
  }

  /* ---------- ratings and reviews ---------- */
  function rateStory(storyId, value) {
    if (!requireAuth()) return;
    setRatings((prev) => ({ ...prev, [storyId]: { ...(prev[storyId] || {}), [session]: value } }));
    notify('Thanks for rating!');
  }

  function addResponse(storyId, text) {
    if (!requireAuth() || !text.trim()) return;
    setResponses((prev) => ({
      ...prev,
      [storyId]: [...(prev[storyId] || []), { username: session, responses: text.trim(), date: today() }],
    }));
  }

  // One review per reader per story: a star rating plus optional text. Saving again updates it.
  function saveReview(storyId, { rating, text }) {
    if (!requireAuth()) return { ok: false };
    const story = stories.find((s) => s.id === storyId);
    if (story?.sellerId === session) return { ok: false, message: 'You can’t review your own story.' };
    if (!rating) return { ok: false, message: 'Choose a star rating first.' };
    setRatings((prev) => ({ ...prev, [storyId]: { ...(prev[storyId] || {}), [session]: rating } }));
    setResponses((prev) => {
      const others = (prev[storyId] || []).filter((r) => r.username !== session);
      const body = (text || '').trim();
      return { ...prev, [storyId]: body ? [...others, { username: session, responses: body, date: today() }] : others };
    });
    notify('Review saved. Thank you!');
    return { ok: true };
  }

  function deleteReview(storyId, username) {
    if (!currentUser || (username !== session && !isAdmin)) return;
    setResponses((prev) => ({ ...prev, [storyId]: (prev[storyId] || []).filter((r) => r.username !== username) }));
    setRatings((prev) => {
      const next = { ...(prev[storyId] || {}) };
      delete next[username];
      return { ...prev, [storyId]: next };
    });
    notify('Review removed.');
  }

  /* ---------- offers and checkout ---------- */
  function findOffer(code) {
    const offer = offers.find((o) => o.code.toLowerCase() === (code || '').trim().toLowerCase());
    if (!offer) return { ok: false, message: 'That code doesn’t match any offer.' };
    if (new Date(offer.validUntil) < new Date()) return { ok: false, message: 'That offer has expired.' };
    if (offer.firstOrderOnly && orders.some((o) => o.username === session)) {
      return { ok: false, message: 'That offer is for first orders only.' };
    }
    return { ok: true, offer };
  }

  function priceWithOffer(subtotal, offer) {
    if (!offer) return subtotal;
    return offer.percent ? subtotal * (1 - offer.percent) : Math.max(0, subtotal - offer.amount);
  }

  // billing: { fullName, email, phone, address, city, postalCode, country }
  // payment: { method: 'card' | 'bkash' | 'cod', label } — the label is a masked summary; we never keep card numbers or CVCs.
  function placeOrder({ billing, payment, promoCode }) {
    if (!session) return { ok: false, message: 'Log in first.' };
    const items = (cart[session] || [])
      .map((id) => stories.find((s) => s.id === id))
      .filter((s) => s && !ownedIds.includes(s.id));
    if (items.length === 0) return { ok: false, message: 'Your cart is empty.' };

    let subtotal = items.reduce((sum, s) => sum + s.price, 0);
    let appliedOffer = null;
    if (promoCode && promoCode.trim()) {
      const result = findOffer(promoCode);
      if (!result.ok) return result;
      appliedOffer = result.offer;
    }
    const total = Number(priceWithOffer(subtotal, appliedOffer).toFixed(2));
    const orderId = genId('order');
    const date = today();

    const order = {
      id: orderId,
      username: session,
      timePlaced: new Date().toISOString(),
      billing,
      payment,
      promoCode: appliedOffer ? appliedOffer.code : null,
      subtotal: Number(subtotal.toFixed(2)),
      total,
      items: items.map((s) => ({ storyId: s.id, title: s.title, price: s.price, sellerId: s.sellerId })),
      storyIds: items.map((s) => s.id),
    };

    setOrders((prev) => [...prev, order]);
    setPurchases((prev) => [...prev, ...items.map((s) => ({ username: session, storyId: s.id, date, orderId }))]);
    setStories((prev) => prev.map((s) => (order.storyIds.includes(s.id) ? { ...s, saleCount: s.saleCount + 1 } : s)));
    setCart((prev) => ({ ...prev, [session]: [] }));
    setWishlist((prev) => ({ ...prev, [session]: (prev[session] || []).filter((id) => !order.storyIds.includes(id)) }));
    return { ok: true, order };
  }

  /* ---------- stories (seller and admin) ---------- */
  const canManage = (story) => !!currentUser && !!story && (isAdmin || story.sellerId === session);

  function buildStoryFields({ name, description, genre, price }) {
    return {
      title: name.trim(),
      text: description,
      blurb: description.replace(/\s+/g, ' ').trim().slice(0, 160),
      minutes: Math.max(2, Math.round(description.split(/\s+/).length / 180)),
      genre,
      price: Number(price),
    };
  }

  function addStory({ name, description, genre, price, accent, cover }) {
    if (!session || !['seller', 'admin'].includes(currentUser?.type)) {
      return { ok: false, message: 'Only seller accounts can list a story.' };
    }
    if (!name?.trim() || !description?.trim() || !price) {
      return { ok: false, message: 'Title, story text and price are required.' };
    }
    if (!cover) return { ok: false, message: 'Add a cover image for your story.' };
    if (!(Number(price) > 0)) return { ok: false, message: 'Price must be more than zero.' };
    const story = {
      id: genId('story'),
      sellerId: session,
      author: currentUser.displayName || session,
      accent: accent || 'sky',
      saleCount: 0,
      status: 'listed',
      createdAt: new Date().toISOString(),
      cover,
      ...buildStoryFields({ name, description, genre: genre || 'Slice of Life', price }),
    };
    setStories((prev) => [story, ...prev]);
    notify('Your story is on the shelf!');
    return { ok: true, story };
  }

  function updateStory(id, { name, description, genre, price, cover }) {
    const story = stories.find((s) => s.id === id);
    if (!canManage(story)) return { ok: false, message: 'You can only edit your own stories.' };
    if (!name?.trim() || !description?.trim() || !(Number(price) > 0)) {
      return { ok: false, message: 'Title, story text and a price above zero are required.' };
    }
    setStories((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...buildStoryFields({ name, description, genre, price }), ...(cover ? { cover } : {}) } : s
      )
    );
    notify('Story updated.');
    return { ok: true };
  }

  function setStoryStatus(id, status) {
    const story = stories.find((s) => s.id === id);
    if (!canManage(story)) return;
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    notify(status === 'hidden' ? 'Story unlisted from the shelf.' : 'Story is back on the shelf.');
  }

  function deleteStory(id) {
    const story = stories.find((s) => s.id === id);
    if (!canManage(story)) return;
    const strip = (map) => Object.fromEntries(Object.entries(map).map(([u, ids]) => [u, ids.filter((x) => x !== id)]));
    setStories((prev) => prev.filter((s) => s.id !== id));
    setCart(strip);
    setWishlist(strip);
    setRecommendations((prev) => prev.filter((r) => r.storyId !== id));
    notify('Story deleted.');
  }

  /* ---------- admin: users ---------- */
  function adminGuard(username) {
    if (!isAdmin) return 'Admin access only.';
    if (username === session) return 'You can’t change your own account here.';
    return null;
  }

  function setUserType(username, type) {
    const err = adminGuard(username);
    if (err) return notify(err);
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, type } : u)));
    notify(`@${username} is now a ${type}.`);
  }

  function setUserStatus(username, status) {
    const err = adminGuard(username);
    if (err) return notify(err);
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, status } : u)));
    notify(status === 'suspended' ? `@${username} was suspended.` : `@${username} was reactivated.`);
  }

  function deleteUser(username) {
    const err = adminGuard(username);
    if (err) return notify(err);
    const owned = new Set(stories.filter((s) => s.sellerId === username).map((s) => s.id));
    setUsers((prev) => prev.filter((u) => u.username !== username));
    setStories((prev) => prev.filter((s) => s.sellerId !== username));
    const dropUser = (map) => {
      const next = { ...map };
      delete next[username];
      return next;
    };
    setCart((prev) => dropUser(prev));
    setWishlist((prev) => dropUser(prev));
    setFriends((prev) => {
      const next = dropUser(prev);
      Object.keys(next).forEach((k) => (next[k] = next[k].filter((f) => f !== username)));
      return next;
    });
    setFriendRequests((prev) => prev.filter((r) => r.from !== username && r.to !== username));
    setRecommendations((prev) => prev.filter((r) => r.from !== username && r.to !== username && !owned.has(r.storyId)));
    notify(`@${username} and their stories were deleted.`);
  }

  /* ---------- friends and recommendations ---------- */
  const friendNames = session ? friends[session] || [] : [];

  function acceptFriend(a, b) {
    setFriends((prev) => ({
      ...prev,
      [a]: (prev[a] || []).includes(b) ? prev[a] : [...(prev[a] || []), b],
      [b]: (prev[b] || []).includes(a) ? prev[b] : [...(prev[b] || []), a],
    }));
  }

  function sendFriendRequest(rawName) {
    if (!requireAuth()) return { ok: false, message: 'Log in first.' };
    const name = (rawName || '').trim();
    const target = users.find((u) => u.username.toLowerCase() === name.toLowerCase());
    if (!target || target.type === 'admin' || target.status === 'suspended') {
      return { ok: false, message: 'No reader with that username was found.' };
    }
    if (target.username === session) return { ok: false, message: 'That’s you! Try someone else.' };
    if (friendNames.includes(target.username)) return { ok: false, message: `You and @${target.username} are already friends.` };
    if (friendRequests.some((r) => r.from === session && r.to === target.username)) {
      return { ok: false, message: 'Request already sent. Waiting for them to accept.' };
    }
    const incoming = friendRequests.find((r) => r.from === target.username && r.to === session);
    if (incoming) {
      acceptFriend(session, target.username);
      setFriendRequests((prev) => prev.filter((r) => r.id !== incoming.id));
      notify(`You and @${target.username} are now friends.`);
      return { ok: true };
    }
    setFriendRequests((prev) => [...prev, { id: genId('fr'), from: session, to: target.username, date: today() }]);
    notify(`Friend request sent to @${target.username}.`);
    return { ok: true };
  }

  function respondFriendRequest(id, accept) {
    const req = friendRequests.find((r) => r.id === id && r.to === session);
    if (!req) return;
    if (accept) {
      acceptFriend(session, req.from);
      notify(`You and @${req.from} are now friends.`);
    }
    setFriendRequests((prev) => prev.filter((r) => r.id !== id));
  }

  function cancelFriendRequest(id) {
    setFriendRequests((prev) => prev.filter((r) => !(r.id === id && r.from === session)));
  }

  function removeFriend(username) {
    if (!session) return;
    setFriends((prev) => ({
      ...prev,
      [session]: (prev[session] || []).filter((f) => f !== username),
      [username]: (prev[username] || []).filter((f) => f !== session),
    }));
    notify(`@${username} was removed from your friends.`);
  }

  function recommendStory(storyId, recipients, note) {
    if (!requireAuth()) return { ok: false, message: 'Log in first.' };
    const valid = recipients.filter((r) => friendNames.includes(r));
    if (valid.length === 0) return { ok: false, message: 'Pick at least one friend.' };
    const skipped = [];
    const fresh = [];
    valid.forEach((to) => {
      const owns = purchases.some((p) => p.username === to && p.storyId === storyId);
      const dup = recommendations.some((r) => r.from === session && r.to === to && r.storyId === storyId);
      if (owns || dup) skipped.push(to);
      else fresh.push({ id: genId('rec'), from: session, to, storyId, note: (note || '').trim(), date: today(), read: false });
    });
    if (fresh.length === 0) {
      return { ok: false, message: 'They already own it or you’ve already recommended it to them.' };
    }
    setRecommendations((prev) => [...prev, ...fresh]);
    notify(`Recommended to ${fresh.map((r) => '@' + r.to).join(', ')} ☕`);
    return { ok: true, skipped };
  }

  function dismissRecommendation(id) {
    setRecommendations((prev) => prev.filter((r) => !(r.id === id && r.to === session)));
  }

  function markRecommendationsRead() {
    setRecommendations((prev) =>
      prev.some((r) => r.to === session && !r.read) ? prev.map((r) => (r.to === session ? { ...r, read: true } : r)) : prev
    );
  }

  const myRecommendations = session
    ? recommendations.filter((r) => r.to === session && stories.some((s) => s.id === r.storyId))
    : [];

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'day' ? 'night' : 'day')),
    users,
    session,
    currentUser,
    isAdmin,
    stories,
    shelfStories,
    genresSource: stories,
    wishlist: session ? wishlist[session] || [] : [],
    cart: session ? cart[session] || [] : [],
    ratings,
    responses,
    orders,
    myOrders: session ? orders.filter((o) => o.username === session) : [],
    purchases: session ? purchases.filter((p) => p.username === session) : [],
    ownedIds,
    offers,
    friends: friendNames,
    incomingRequests: session ? friendRequests.filter((r) => r.to === session) : [],
    outgoingRequests: session ? friendRequests.filter((r) => r.from === session) : [],
    myRecommendations,
    unreadRecommendations: myRecommendations.filter((r) => !r.read).length,
    toast,
    notify,
    login,
    signup,
    logout,
    toggleWishlist,
    toggleCart,
    removeFromCart,
    moveToWishlist,
    rateStory,
    addResponse,
    saveReview,
    deleteReview,
    findOffer,
    priceWithOffer,
    placeOrder,
    addStory,
    updateStory,
    setStoryStatus,
    deleteStory,
    setUserType,
    setUserStatus,
    deleteUser,
    sendFriendRequest,
    respondFriendRequest,
    cancelFriendRequest,
    removeFriend,
    recommendStory,
    dismissRecommendation,
    markRecommendationsRead,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
