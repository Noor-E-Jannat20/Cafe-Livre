// Seed RATING and RESPONSES rows so the shelf doesn't feel empty on first load.
// Keyed by storyId -> { [username]: rating } and storyId -> [{ username, responses, date }]

export const seedRatings = {
  'moth-hour': { 'reader.demo': 5, 'grace.lindqvist': 4 },
  'the-quiet-witness': { 'reader.demo': 4 },
  'letters-to-the-lighthouse': { 'reader.demo': 5, 'ilsa.brandt': 5 },
  'the-last-analog-year': { 'reader.demo': 4 },
  'the-house-that-counted': { 'reader.demo': 5 },
  'nine-minutes-of-gravity': { 'reader.demo': 4 },
  'the-recipe-for-tuesdays': { 'reader.demo': 5, 'priya.sundaram': 5 },
  'the-fox-who-kept-score': { 'reader.demo': 4 },
};

export const seedResponses = {
  'moth-hour': [
    { username: 'reader.demo', responses: 'Read this with actual tea and cried a little. Worth it.', date: '2026-06-02' },
  ],
  'letters-to-the-lighthouse': [
    { username: 'reader.demo', responses: 'The kind of ending you have to sit with for a minute.', date: '2026-07-11' },
  ],
  'the-house-that-counted': [
    { username: 'reader.demo', responses: 'Made me nervous to text anyone "on my way!" for a week.', date: '2026-08-20' },
  ],
};
