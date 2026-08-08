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
    <div className="mb-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-medium text-gray-500">Monthly tracker</h2>
      <div className="min-w-max">
        <div className="flex gap-1 mb-1">
          <div className="w-24 shrink-0" />
          {dayLabels.map((d) => (
            <div
              key={d}
              className={`w-7 text-center text-[11px] tabular-nums ${
                d % 7 === 0 || d % 7 === 6 ? 'text-gray-400' : 'text-gray-300'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-1 mb-1.5">
            <div className="w-24 shrink-0 truncate text-sm text-gray-600 pr-2">
              {habit.icon} {habit.name}
            </div>
            <div className="flex gap-1">
              {habit.records.map((done, idx) => {
                const day = idx + 1;
                const isFuture = isCurrentMonth && day > currentDay;
                const isToday = isCurrentMonth && day === currentDay;

                if (isFuture) {
                  return (
                    <div key={day} className="h-7 w-7 rounded-md bg-gray-50" />
                  );
                }

                return (
                  <button
                    key={day}
                    onClick={() => onToggle(habit.id, day)}
                    className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-50 text-red-400 border border-red-100'
                    } ${isToday ? 'ring-2 ring-gray-900 ring-offset-1' : ''}`}
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
