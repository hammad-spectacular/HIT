import type { Habit } from '../types';

function getStatusColor(pct: number): string {
  if (pct >= 95) return '#10b981';
  if (pct >= 80) return '#3b82f6';
  if (pct >= 60) return '#f59e0b';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

function getStatusLabel(pct: number): string {
  if (pct >= 95) return 'Excellent';
  if (pct >= 80) return 'Very good';
  if (pct >= 60) return 'Improving';
  if (pct >= 40) return 'Needs attention';
  return 'Poor';
}

interface Props {
  habits: Habit[];
}

export default function HabitList({ habits }: Props) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-[#141416] dark:border-gray-800">
      <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Habit overview</h2>
      <div className="space-y-3">
        {habits.map((habit) => {
          const color = getStatusColor(habit.stats.percentage);
          return (
            <div key={habit.id} className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: `${habit.color}18` }}
              >
                {habit.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{habit.name}</span>
                  <span className="text-sm font-medium tabular-nums" style={{ color }}>
                    {habit.stats.percentage}%
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-[#292a2e]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${habit.stats.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-400">
                  {habit.stats.completed} done · {habit.stats.missed} missed · streak {habit.stats.currentStreak}d · {getStatusLabel(habit.stats.percentage)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
