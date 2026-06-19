export const config = {
  usdToInr: 84,
  defaultPageSize: 25,
  maxPageSize: 100,
  duplicateWindowHours: 48,
  duplicateSalaryTolerancePercent: 10,
  siteName: 'TalentDash',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

export const LEVELS = [
  'L3',
  'L4',
  'L5',
  'L6',
  'SDE_I',
  'SDE_II',
  'SDE_III',
  'STAFF',
  'PRINCIPAL',
  'IC4',
  'IC5',
] as const;

export const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'] as const;

export const SOURCES = ['CONTRIBUTOR', 'SCRAPED', 'AI_INFERRED'] as const;

export const LOCATIONS = [
  'Bengaluru',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Delhi',
  'San Francisco',
  'London',
] as const;
