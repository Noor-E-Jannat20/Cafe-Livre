import TeaSteamArt from './TeaSteamArt';

export default function Hero({ storyCount, onBrowse }) {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div>
          <span className="eyebrow-pill glass" style={{ boxShadow: 'none' }}>
            ☕ fresh stories brewed weekly
          </span>
          <h1>Small stories, poured by the cup.</h1>
          <p className="hero-sub">
            Loose Leaf is a corner shop for fiction you can finish in one sitting — a
            handful of pages, a full feeling. Browse the shelf, steep something short,
            keep the ones that stay with you.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onBrowse}>
              Browse the shelf
            </button>
            <button className="btn-ghost" onClick={onBrowse}>
              See today&rsquo;s picks
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <b>{storyCount}</b>
              <span>stories on the shelf</span>
            </div>
            <div className="hero-stat">
              <b>3–7 min</b>
              <span>average read</span>
            </div>
            <div className="hero-stat">
              <b>$1.25+</b>
              <span>a cup, so to speak</span>
            </div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <TeaSteamArt />
        </div>
      </div>
    </section>
  );
}
