export const BILLING = ['Monthly', 'Annual'] as const;

export const LOGOS = ['Marbl', 'Fenwick', 'Aster Co', 'Loop Labs'] as const;

export const PLANS = [
  { name: 'Starter', price: '$0', tagline: 'Solo launches', slot: 'data1' as const },
  { name: 'Studio', price: '$38', tagline: 'Growing teams', slot: 'primaryAction' as const, featured: true },
  { name: 'Scale', price: '$96', tagline: 'Multi-brand orgs', slot: 'data4' as const },
] as const;

export const PROOF_POINTS = [
  { label: 'Faster approval', slot: 'data1' },
  { label: 'Reusable launch kit', slot: 'data2' },
  { label: 'Accessible by default', slot: 'data3' },
] as const;

export type LandingBilling = (typeof BILLING)[number];
