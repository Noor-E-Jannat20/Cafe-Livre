// Promo codes. `amount` is a flat dollar discount, `percent` is a fraction (0.15 = 15%).
// validUntil is inclusive; adminId matches the seeded admin account.

export const seedOffers = [
  {
    code: 'WELCOME10',
    adminId: 'admin',
    description: '$0.50 off your first order',
    amount: 0.5,
    validUntil: '2027-01-01',
  },
  {
    code: 'NIGHTOWL',
    adminId: 'admin',
    description: '15% off — for anyone reading after dark',
    percent: 0.15,
    validUntil: '2027-01-01',
  },
  {
    code: 'STALE2025',
    adminId: 'admin',
    description: '20% off (expired promo, kept to demo validity checks)',
    percent: 0.2,
    validUntil: '2025-01-01',
  },
];
