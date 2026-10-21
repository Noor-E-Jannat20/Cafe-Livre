import { average } from '../components/RatingStars';

// Ranks stories a reader doesn't own yet, using genre taste (purchases, wishlist, ratings),
// friends' recommendations, and overall popularity. Returns [{ story, reason }].
export function pickForYou({ stories, ownedIds, wishlist, ratings, session, friendRecs, limit = 6 }) {
  const byId = Object.fromEntries(stories.map((s) => [s.id, s]));
  const genreScore = {};
  const bump = (id, w) => {
    const s = byId[id];
    if (s) genreScore[s.genre] = (genreScore[s.genre] || 0) + w;
  };
  ownedIds.forEach((id) => bump(id, 2));
  wishlist.forEach((id) => bump(id, 1));
  Object.entries(ratings).forEach(([id, map]) => {
    const r = map?.[session];
    if (r >= 4) bump(id, 1.5);
    else if (r && r <= 2) bump(id, -1.5);
  });

  const recFrom = {};
  friendRecs.forEach((r) => {
    (recFrom[r.storyId] = recFrom[r.storyId] || []).push(r.from);
  });

  const owned = new Set(ownedIds);
  return stories
    .filter((s) => !owned.has(s.id) && s.sellerId !== session)
    .map((s) => {
      const avg = average(ratings[s.id]) || 0;
      const liked = genreScore[s.genre] || 0;
      const score = liked + avg * 0.4 + Math.log10(s.saleCount + 1) * 0.5 + (recFrom[s.id] ? 3 : 0);
      const reason = recFrom[s.id]
        ? `Recommended by @${recFrom[s.id][0]}`
        : liked > 0
          ? `Because you like ${s.genre}`
          : 'Popular on the shelf';
      return { story: s, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
