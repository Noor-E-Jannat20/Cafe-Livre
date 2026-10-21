import { useState } from 'react';
import { useApp } from '../state/store';
import { StarDisplay, average } from './RatingStars';
import CoverArt from './CoverArt';

export default function SellerDashboard({ onSell, onEdit, onOpenStory }) {
  const { session, stories, ratings, responses, orders, setStoryStatus, deleteStory } = useApp();
  const [confirmId, setConfirmId] = useState(null);

  const mine = stories.filter((s) => s.sellerId === session);
  const units = mine.reduce((n, s) => n + s.saleCount, 0);
  const gross = mine.reduce((n, s) => n + s.saleCount * s.price, 0);
  const allRatings = mine.flatMap((s) => Object.values(ratings[s.id] || {}));
  const avg = allRatings.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : null;
  const reviewCount = mine.reduce((n, s) => n + (responses[s.id] || []).length, 0);
  const maxSold = Math.max(1, ...mine.map((s) => s.saleCount));

  const recentSales = orders
    .flatMap((o) => (o.items || []).filter((i) => i.sellerId === session).map((i) => ({ ...i, buyer: o.username, at: o.timePlaced, key: `${o.id}-${i.storyId}` })))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6);

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>Seller dashboard</h2>
          <button className="btn-primary" style={{ border: 'none', padding: '10px 20px' }} onClick={onSell}>+ Register a story</button>
        </div>

        <div className="stat-grid">
          <div className="stat-tile glass"><span>Stories listed</span><b>{mine.filter((s) => s.status !== 'hidden').length}<small> / {mine.length}</small></b></div>
          <div className="stat-tile glass"><span>Copies sold</span><b>{units}</b></div>
          <div className="stat-tile glass"><span>Sales value</span><b>${gross.toFixed(2)}</b></div>
          <div className="stat-tile glass"><span>Average rating</span><b>{avg ? avg.toFixed(1) : '—'}<small> ({allRatings.length})</small></b></div>
          <div className="stat-tile glass"><span>Written reviews</span><b>{reviewCount}</b></div>
        </div>

        {mine.length === 0 ? (
          <div className="empty-note glass">You haven’t registered a story yet. Add a cover and your first story to open your shelf.</div>
        ) : (
          <>
            <div className="panel glass">
              <h3 className="modal-subhead">Your stories</h3>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Story</th><th>Price</th><th>Sold</th><th>Rating</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {mine.map((s) => {
                      const map = ratings[s.id];
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="row-story">
                              <div className="row-cover"><CoverArt story={s} size="thumb" /></div>
                              <div>
                                <button className="mini-title" onClick={() => onOpenStory(s.id)}>{s.title}</button>
                                <div className="mini-sub">{s.genre}</div>
                                <div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${(s.saleCount / maxSold) * 100}%` }} /></div>
                              </div>
                            </div>
                          </td>
                          <td>${s.price.toFixed(2)}</td>
                          <td>{s.saleCount}</td>
                          <td><StarDisplay value={average(map)} count={map ? Object.keys(map).length : 0} /></td>
                          <td><span className={`status-pill ${s.status === 'hidden' ? 'off' : 'on'}`}>{s.status === 'hidden' ? 'Unlisted' : 'Listed'}</span></td>
                          <td className="row-actions">
                            <button className="remove-btn" onClick={() => onEdit(s)}>edit</button>
                            <button className="remove-btn" onClick={() => setStoryStatus(s.id, s.status === 'hidden' ? 'listed' : 'hidden')}>
                              {s.status === 'hidden' ? 'list' : 'unlist'}
                            </button>
                            {confirmId === s.id ? (
                              <>
                                <button className="remove-btn danger" onClick={() => { deleteStory(s.id); setConfirmId(null); }}>confirm delete</button>
                                <button className="remove-btn" onClick={() => setConfirmId(null)}>cancel</button>
                              </>
                            ) : (
                              <button className="remove-btn danger" onClick={() => setConfirmId(s.id)}>delete</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel glass">
              <h3 className="modal-subhead">Recent sales</h3>
              {recentSales.length === 0 ? (
                <p className="auth-hint">New orders for your stories will show up here.</p>
              ) : (
                <ul className="order-items">
                  {recentSales.map((r) => (
                    <li key={r.key}><span>{r.title} <span className="mini-sub">to @{r.buyer} · {new Date(r.at).toLocaleDateString()}</span></span><span>${r.price.toFixed(2)}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
