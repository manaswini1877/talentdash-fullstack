import { LEVEL_BAR_COLORS } from '@/lib/level-colors';
import { formatLevelLabel } from '@/lib/format';

interface LevelDistributionBarProps {
  distribution: Record<string, number>;
}

export function LevelDistributionBar({
  distribution,
}: LevelDistributionBarProps) {
  const entries = Object.entries(distribution).sort(
    (a, b) => b[1] - a[1],
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="h-8 rounded-full bg-app-bg">
        <span className="sr-only">No level data</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-8 overflow-hidden rounded-full bg-app-bg">
        {entries.map(([level, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={level}
              className="h-full transition-all"
              style={{
                width: `${percentage}%`,
                backgroundColor: LEVEL_BAR_COLORS[level] ?? '#64748b',
                minWidth: percentage > 0 ? '2px' : '0',
              }}
              title={`${formatLevelLabel(level)}: ${count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {entries.map(([level, count]) => {
          const percentage = ((count / total) * 100).toFixed(1);
          return (
            <div key={level} className="flex items-center gap-1.5 text-metadata">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: LEVEL_BAR_COLORS[level] ?? '#64748b',
                }}
              />
              <span className="text-body-text">
                {formatLevelLabel(level)}: {count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
