import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/store';
import { pickForYou } from '../utils/recommend';
import MiniStory from './MiniStory';

const TABS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'history', label: 'Purchase history' },
  { id: 'friends', label: 'Friends' },
];

export default function AccountPage({ tab, onTab, onOpenStory, onRecommend, onBrowse }) {
  const app = useApp();
  const { stories, shelfStories, wishlist, ownedIds, ratings, session, myRecommendations, myOrders } = app;

  useEffect(() => {
    if (tab === 'recommended') app.markRecommendationsRead();
    // Mark friend picks as seen once the reader has had the tab open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const byId = (id) => stories.find((s) => s.id === id);
  const friendPicks = myRecommendations;
  const picks = useMemo(
    () =>
      pickForYou({
        stories: shelfStories,
        ownedIds,
        wishlist,
        ratings,
        session,
        friendRecs: friendPicks,
        limit: 6,
      }),
    [shelfStories, ownedIds, wishlist, ratings, session, friendPicks]
  );

  const cartBtn = (s) =>
    ownedIds.includes(s.id) ? (
      <span className="owned-pill">✓ Owned</span>
    ) : (
      <button className={`btn-ghost mini-btn${app.cart.includes(s.id) ? ' on' : ''}`} onClick={() => app.toggleCart(s.id)}>
        {app.cart.includes(s.id) ? '✓ In cart' : '+ Add to cart'}
      </button>
    );

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>My account</h2>
          <p>@{session}</p>
        </div>
        <div className="tab-row" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`genre-chip${tab === t.id ? ' active' : ''}`} onClick={() => onTab(t.id)}>
              {t.label}
              {t.id === 'friends' && app.incomingRequests.length > 0 ? ` (${app.incomingRequests.length})` : ''}
            </button>
          ))}
        </div>

        {tab === 'recommended' && (
          <div className="stack">
            <h3 className="modal-subhead">From your friends</h3>
            {friendPicks.length === 0 && (
              <p className="empty-note glass">No recommendations yet. When a friend recommends a story, it lands here.</p>
            )}
            {friendPicks.map((r) => {
              const s = byId(r.storyId);
              return (
                <MiniStory key={r.id} story={s} onOpen={onOpenStory} note={`@${r.from}${r.note ? `: “${r.note}”` : ' recommended this to you.'}`}>
                  {cartBtn(s)}
                  <button className="remove-btn" onClick={() => app.dismissRecommendation(r.id)}>dismiss</button>
                </MiniStory>
              );
            })}

            <h3 className="modal-subhead">Picked for you</h3>
            {picks.length === 0 && <p className="empty-note glass">You own everything on the shelf. Check back soon.</p>}
            <div className="mini-grid">
              {picks.map(({ story, reason }) => (
                <MiniStory key={story.id} story={story} onOpen={onOpenStory} note={reason}>
                  {cartBtn(story)}
                  <button className="remove-btn" onClick={() => onRecommend(story.id)}>recommend</button>
                </MiniStory>
              ))}
            </div>
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="stack">
            {wishlist.length === 0 && (
              <div className="empty-note glass">
                Your wishlist is empty. Tap ♡ on a story to save it.{' '}
                <button className="btn-ghost mini-btn" onClick={onBrowse}>Browse stories</button>
              </div>
            )}
            <div className="mini-grid">
              {wishlist.map(byId).filter(Boolean).map((s) => (
                <MiniStory key={s.id} story={s} onOpen={onOpenStory}>
                  {cartBtn(s)}
                  <button className="remove-btn" onClick={() => app.toggleWishlist(s.id)}>remove</button>
                </MiniStory>
              ))}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="stack">
            {myOrders.length === 0 && (
              <div className="empty-note glass">
                No purchases yet.{' '}
                <button className="btn-ghost mini-btn" onClick={onBrowse}>Browse stories</button>
              </div>
            )}
            {myOrders.slice().reverse().map((o) => (
              <article key={o.id} className="order-card glass">
                <div className="order-head">
                  <div>
                    <b>Order {o.id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}</b>
                    <div className="mini-sub">{new Date(o.timePlaced).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {o.payment?.label || o.payment}</div>
                  </div>
                  <b>${o.total.toFixed(2)}</b>
                </div>
                <ul className="order-items">
                  {(o.items || o.storyIds.map((id) => ({ storyId: id, title: byId(id)?.title || 'Story', price: byId(id)?.price || 0 }))).map((i) => (
                    <li key={i.storyId}>
                      <button className="mini-title" onClick={() => byId(i.storyId) && onOpenStory(i.storyId)} disabled={!byId(i.storyId)}>
                        {i.title}{!byId(i.storyId) ? ' (no longer listed)' : ''}
                      </button>
                      <span>${i.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {o.promoCode && <div className="mini-sub">Offer {o.promoCode} applied</div>}
              </article>
            ))}
            {myOrders.length > 0 && <p className="auth-hint">Open a story to read it in full and leave a review.</p>}
          </div>
        )}

        {tab === 'friends' && <Friends />}
      </div>
    </section>
  );
}

function Friends() {
  const { friends, users, session, incomingRequests, outgoingRequests, sendFriendRequest, respondFriendRequest, cancelFriendRequest, removeFriend } = useApp();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);

  function add(username) {
    const r = sendFriendRequest(username);
    setMsg(r.ok ? null : r.message);
    if (r.ok) setName('');
  }

  const nameOf = (u) => users.find((x) => x.username === u)?.displayName || u;
  const taken = new Set([session, ...friends, ...outgoingRequests.map((r) => r.to), ...incomingRequests.map((r) => r.from)]);
  const suggestions = users.filter((u) => u.type === 'buyer' && u.status !== 'suspended' && !taken.has(u.username)).slice(0, 5);

  return (
    <div className="stack">
      <form
        className="friend-add glass"
        onSubmit={(e) => {
          e.preventDefault();
          add(name);
        }}
      >
        <label>
          Add a friend by username
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. mira.reads" />
        </label>
        <button className="btn-primary" type="submit" style={{ border: 'none' }}>Send request</button>
      </form>
      {msg && <p className="auth-error" role="alert">{msg}</p>}

      {incomingRequests.length > 0 && (
        <>
          <h3 className="modal-subhead">Friend requests</h3>
          {incomingRequests.map((r) => (
            <div key={r.id} className="friend-row glass">
              <span><b>{nameOf(r.from)}</b> <span className="mini-sub">@{r.from}</span></span>
              <span className="friend-actions">
                <button className="btn-ghost mini-btn" onClick={() => respondFriendRequest(r.id, true)}>Accept</button>
                <button className="remove-btn" onClick={() => respondFriendRequest(r.id, false)}>decline</button>
              </span>
            </div>
          ))}
        </>
      )}

      <h3 className="modal-subhead">Your friends ({friends.length})</h3>
      {friends.length === 0 && <p className="empty-note glass">No friends yet. Add someone above, then recommend stories to them.</p>}
      {friends.map((f) => (
        <div key={f} className="friend-row glass">
          <span><b>{nameOf(f)}</b> <span className="mini-sub">@{f}</span></span>
          <button className="remove-btn" onClick={() => removeFriend(f)}>remove</button>
        </div>
      ))}

      {outgoingRequests.length > 0 && (
        <>
          <h3 className="modal-subhead">Waiting for a reply</h3>
          {outgoingRequests.map((r) => (
            <div key={r.id} className="friend-row glass">
              <span>@{r.to}</span>
              <button className="remove-btn" onClick={() => cancelFriendRequest(r.id)}>cancel</button>
            </div>
          ))}
        </>
      )}

      {suggestions.length > 0 && (
        <>
          <h3 className="modal-subhead">Readers on Cafe Livre</h3>
          {suggestions.map((u) => (
            <div key={u.username} className="friend-row glass">
              <span><b>{u.displayName}</b> <span className="mini-sub">@{u.username}</span></span>
              <button className="btn-ghost mini-btn" onClick={() => add(u.username)}>Add friend</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
