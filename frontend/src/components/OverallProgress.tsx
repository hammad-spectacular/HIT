import type { MonthData } from '../types';

function getStatusColor(pct: number): string {
  if (pct >= 95) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-blue-500';
  if (pct >= 60) return 'bg-amber-500';
  if (pct >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

interface Props {
  data: MonthData;
}

export default function OverallProgress({ data }: Props) {
  const { overall } = data;
  const barColor = getStatusColor(overall.percentage);

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-medium text-gray-500">Overall progress</h2>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${overall.percentage}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        <span className="text-xl font-semibold tabular-nums">{overall.percentage}%</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400">Current streak</p>
          <p className="text-lg font-medium tabular-nums">{overall.currentStreak} days</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Longest streak</p>
          <p className="text-lg font-medium tabular-nums">{overall.longestStreak} days</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Habits tracked</p>
          <p className="text-lg font-medium tabular-nums">{data.habits.length}</p>
        </div>
      </div>
    </div>
  );
}
