import type { MonthData } from '../types';

interface Props {
  data: MonthData;
  onToggle: (habitId: number, day: number) => void;
}

export default function MonthlyTracker({ data, onToggle }: Props) {
  const { habits, meta } = data;
  const { daysInMonth, currentDay, isCurrentMonth } = meta;

  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="mb-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-[#141416] dark:border-gray-800">
      <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Monthly tracker</h2>
      <div className="min-w-max">
        <div className="flex gap-1 mb-1">
          <div className="w-28 shrink-0" />
          {dayLabels.map((d) => (
            <div
              key={d}
              className={`w-7 text-center text-[11px] tabular-nums ${
                d % 7 === 0 || d % 7 === 6 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {habits.map((habit) => (
          <div key={habit.id} className="flex items-start gap-1 mb-1.5">
            <div className="w-28 shrink-0 text-sm text-gray-600 pr-2 pt-0.5 break-words leading-tight dark:text-gray-300">
              {habit.icon} {habit.name}
            </div>
            <div className="flex gap-1">
              {habit.records.map((done, idx) => {
                const day = idx + 1;
                const isFuture = isCurrentMonth && day > currentDay;
                const isToday = isCurrentMonth && day === currentDay;

                if (isFuture) {
                  return (
                    <div key={day} className="h-7 w-7 rounded-md bg-gray-50 dark:bg-[#16161a]" />
                  );
                }

                return (
                  <button
                    key={day}
                    onClick={() => onToggle(habit.id, day)}
                    className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-50 text-red-400 border border-red-100 dark:bg-[#1b1b1f] dark:text-red-300 dark:border-gray-700'
                    } ${isToday ? 'ring-2 ring-gray-900 ring-offset-1 dark:ring-gray-500' : ''}`}
                  >
                    {done ? '✓' : '✕'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
