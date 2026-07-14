import type { PreviewIconName } from './previewIcons';

export const DASHBOARD_NAV: Array<{ label: string; icon: PreviewIconName }> = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Pipeline', icon: 'activity' },
  { label: 'Accounts', icon: 'users' },
  { label: 'Forecast', icon: 'trending' },
];

export const DASHBOARD_RANGES = ['7d', '30d', '90d'] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const DASHBOARD_METRICS = [
  { label: 'Pipeline', value: '$84.2k', trend: '12%', dir: 'up' as const, trendSlot: 'data1', spark: [12, 18, 15, 22, 19, 27, 24] },
  { label: 'Conversion', value: '18.4%', trend: '3.1%', dir: 'up' as const, trendSlot: 'data2', spark: [8, 9, 8, 11, 13, 12, 15] },
  { label: 'Velocity', value: '142', trend: '2.4%', dir: 'down' as const, trendSlot: 'data3', spark: [20, 22, 19, 17, 18, 16, 15] },
  { label: 'Risk', value: '7', trend: '1', dir: 'up' as const, trendSlot: 'data4', spark: [3, 4, 4, 5, 5, 6, 7] },
] as const;

export function buildDashboardActivity(colors: {
  data1: string;
  data2: string;
  data3: string;
}) {
  return [
    { label: 'Invoice approved', detail: 'North America · 2m ago', initials: 'NA', color: colors.data1, slot: 'data1' as const },
    { label: 'New account opened', detail: 'Self-serve · 18m ago', initials: 'SS', color: colors.data2, slot: 'data2' as const },
    { label: 'Budget threshold', detail: 'Needs review · 1h ago', initials: 'BT', color: colors.data3, slot: 'data3' as const },
  ] as const;
}
