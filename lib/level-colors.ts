import type { Level } from '@prisma/client';

const LEVEL_BADGE_COLORS: Record<Level, string> = {
  L3: 'bg-slate-100 text-slate-700',
  SDE_I: 'bg-slate-100 text-slate-700',
  L4: 'bg-blue-100 text-blue-700',
  SDE_II: 'bg-blue-100 text-blue-700',
  L5: 'bg-indigo-100 text-indigo-700',
  SDE_III: 'bg-indigo-100 text-indigo-700',
  L6: 'bg-purple-100 text-purple-700',
  STAFF: 'bg-purple-100 text-purple-700',
  PRINCIPAL: 'bg-slate-800 text-white',
  IC4: 'bg-indigo-100 text-indigo-700',
  IC5: 'bg-purple-100 text-purple-700',
};

export function getLevelBadgeClass(level: Level | string): string {
  return (
    LEVEL_BADGE_COLORS[level as Level] ?? 'bg-slate-100 text-slate-700'
  );
}

export const LEVEL_BAR_COLORS: Record<string, string> = {
  L3: '#64748b',
  L4: '#3b82f6',
  L5: '#6366f1',
  L6: '#a855f7',
  SDE_I: '#94a3b8',
  SDE_II: '#60a5fa',
  SDE_III: '#818cf8',
  STAFF: '#c084fc',
  PRINCIPAL: '#1e293b',
  IC4: '#6366f1',
  IC5: '#a855f7',
};
