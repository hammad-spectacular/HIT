import type { MonthData } from '../types';

interface Props {
  data: MonthData;
}

export default function Insights({ data }: Props) {
  const { habits, overall } = data;

  if (habits.length === 0) return null;

  const completionsPerDay = habits[0]?.records.map((_, dayIdx) =>
    habits.filter((h) => h.records[dayIdx]).length,
  ) ?? [];
  const maxCompletions = Math.max(...completionsPerDay, 0);
  const bestDayIndex = completionsPerDay.indexOf(maxCompletions);
  const bestDay = bestDayIndex >= 0 ? bestDayIndex + 1 : 0;

  const items = [
    { label: 'Monthly completion', value: `${overall.percentage}%`, highlight: true },
    {
      label: 'Best day',
      value: bestDay > 0 ? `Day ${bestDay}` : '—',
      sub: bestDay > 0 ? `${maxCompletions}/${habits.length} habits completed` : undefined,
    },
    { label: 'Current streak', value: `${overall.currentStreak}d`, highlight: true },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="insight-card">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</p>
          <p
            className={`mt-2 text-lg font-bold ${
              item.highlight
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {item.value}
          </p>
          {item.sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}
