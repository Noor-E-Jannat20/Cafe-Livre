import { useState } from 'react';
import { useApp } from '../state/store';
import { StarDisplay, average } from './RatingStars';
import CoverArt from './CoverArt';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Manage users' },
  { id: 'stories', label: 'Manage stories' },
];

export default function AdminDashboard({ onEdit, onOpenStory }) {
  const [tab, setTab] = useState('overview');
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head"><h2>Admin dashboard</h2></div>
        <div className="tab-row" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`genre-chip${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'overview' && <Overview />}
        {tab === 'users' && <Users />}
        {tab === 'stories' && <Stories onEdit={onEdit} onOpenStory={onOpenStory} />}
      </div>
    </section>
  );
}

function Overview() {
  const { users, stories, orders } = useApp();
  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const count = (t) => users.filter((u) => u.type === t).length;
  const recent = orders.slice(-5).reverse();
  return (
    <>
      <div className="stat-grid">
        <div className="stat-tile glass"><span>Users</span><b>{users.length}</b></div>
        <div className="stat-tile glass"><span>Buyers / sellers</span><b>{count('buyer')}<small> / {count('seller')}</small></b></div>
        <div className="stat-tile glass"><span>Stories</span><b>{stories.length}<small> ({stories.filter((s) => s.status === 'hidden').length} unlisted)</small></b></div>
        <div className="stat-tile glass"><span>Orders placed</span><b>{orders.length}</b></div>
        <div className="stat-tile glass"><span>Order revenue</span><b>${revenue.toFixed(2)}</b></div>
      </div>
      <div className="panel glass">
        <h3 className="modal-subhead">Latest orders</h3>
        {recent.length === 0 ? (
          <p className="auth-hint">No orders yet. They’ll appear here as readers check out.</p>
        ) : (
          <ul className="order-items">
            {recent.map((o) => (
              <li key={o.id}>
                <span>@{o.username} · {(o.items || []).map((i) => i.title).join(', ') || `${o.storyIds.length} stories`} <span className="mini-sub">{o.payment?.label || o.payment}</span></span>
                <span>${o.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Users() {
  const { users, session, stories, setUserType, setUserStatus, deleteUser } = useApp();
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(null);
  const list = users.filter((u) => `${u.username} ${u.displayName}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="panel glass">
      <label className="search-field">
        <span className="sr-only">Search users</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username or name" />
      </label>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {list.map((u) => {
              const self = u.username === session;
              const suspended = u.status === 'suspended';
              const storyCount = stories.filter((s) => s.sellerId === u.username).length;
              return (
                <tr key={u.username}>
                  <td><b>{u.displayName}</b><div className="mini-sub">@{u.username}{self ? ' (you)' : ''}</div></td>
                  <td>
                    <select value={u.type} disabled={self} onChange={(e) => setUserType(u.username, e.target.value)} aria-label={`Role for ${u.username}`}>
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.dateOfCreation}</td>
                  <td><span className={`status-pill ${suspended ? 'off' : 'on'}`}>{suspended ? 'Suspended' : 'Active'}</span></td>
                  <td className="row-actions">
                    {!self && (
                      <>
                        <button className="remove-btn" onClick={() => setUserStatus(u.username, suspended ? 'active' : 'suspended')}>
                          {suspended ? 'reactivate' : 'suspend'}
                        </button>
                        {confirm === u.username ? (
                          <>
                            <button className="remove-btn danger" onClick={() => { deleteUser(u.username); setConfirm(null); }}>
                              confirm{storyCount ? ` (+${storyCount} ${storyCount === 1 ? 'story' : 'stories'})` : ''}
                            </button>
                            <button className="remove-btn" onClick={() => setConfirm(null)}>cancel</button>
                          </>
                        ) : (
                          <button className="remove-btn danger" onClick={() => setConfirm(u.username)}>delete</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={5} className="auth-hint">No users match “{q}”.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="auth-hint">Suspended users can’t log in and their stories leave the shelf. Deleting a seller also deletes their stories.</p>
    </div>
  );
}

function Stories({ onEdit, onOpenStory }) {
  const { stories, ratings, setStoryStatus, deleteStory } = useApp();
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(null);
  const list = stories.filter((s) => `${s.title} ${s.sellerId} ${s.genre}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="panel glass">
      <label className="search-field">
        <span className="sr-only">Search stories</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, seller or genre" />
      </label>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Story</th><th>Seller</th><th>Price</th><th>Sold</th><th>Rating</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {list.map((s) => {
              const map = ratings[s.id];
              const hidden = s.status === 'hidden';
              return (
                <tr key={s.id}>
                  <td>
                    <div className="row-story">
                      <div className="row-cover"><CoverArt story={s} size="thumb" /></div>
                      <div>
                        <button className="mini-title" onClick={() => onOpenStory(s.id)}>{s.title}</button>
                        <div className="mini-sub">{s.genre}</div>
                      </div>
                    </div>
                  </td>
                  <td>@{s.sellerId}</td>
                  <td>${s.price.toFixed(2)}</td>
                  <td>{s.saleCount}</td>
                  <td><StarDisplay value={average(map)} count={map ? Object.keys(map).length : 0} /></td>
                  <td><span className={`status-pill ${hidden ? 'off' : 'on'}`}>{hidden ? 'Unlisted' : 'Listed'}</span></td>
                  <td className="row-actions">
                    <button className="btn-ghost mini-btn" onClick={() => onEdit(s)}>✎ Edit</button>
                    <button className="remove-btn" onClick={() => setStoryStatus(s.id, hidden ? 'listed' : 'hidden')}>{hidden ? 'list' : 'unlist'}</button>
                    {confirm === s.id ? (
                      <>
                        <button className="remove-btn danger" onClick={() => { deleteStory(s.id); setConfirm(null); }}>confirm delete</button>
                        <button className="remove-btn" onClick={() => setConfirm(null)}>cancel</button>
                      </>
                    ) : (
                      <button className="remove-btn danger" onClick={() => setConfirm(s.id)}>delete</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={7} className="auth-hint">No stories match “{q}”.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
