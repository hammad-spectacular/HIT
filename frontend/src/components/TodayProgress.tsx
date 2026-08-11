import type { Habit } from '../types';

interface Props {
  habits: Habit[];
  selectedDate: string;
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TodayProgress({ habits, selectedDate }: Props) {
  const todayStr = toDateString(new Date());
  const isToday = selectedDate === todayStr;
  const dayIndex = new Date(selectedDate).getDate() - 1;

  const completed = habits.filter((h) => h.records[dayIndex]).length;
  const total = habits.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const label = isToday ? 'completed today' : 'completed that day';

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-4xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {completed}/{total}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{percentage}%</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">progress</p>
        </div>
      </div>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
