import type { Level } from '@prisma/client';
import { getLevelBadgeClass } from '@/lib/level-colors';
import { formatLevelLabel } from '@/lib/format';

interface LevelBadgeProps {
  level: Level | string;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-medium ${getLevelBadgeClass(level)}`}
    >
      {formatLevelLabel(level)}
    </span>
  );
}
