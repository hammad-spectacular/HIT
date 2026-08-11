import { Loader2 } from 'lucide-react';
import type { Habit } from '../types';
import { getDayStatus, getRecentMissedLabel } from '../lib/habitUtils';
import HabitName from './HabitName';

interface Props {
  habits: Habit[];
  selectedDate: string;
  pendingRecordKeys: Set<string>;
  onToggle: (habitId: number, day: number) => void;
  onCompleted?: () => void;
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function statusBadgeClass(label: string) {
  if (label === 'Completed') return 'status-badge-completed';
  if (label === 'Missed') return 'status-badge-missed';
  return 'status-badge-pending';
}

export default function TodayHabits({ habits, selectedDate, pendingRecordKeys, onToggle, onCompleted }: Props) {
  const todayStr = toDateString(new Date());
  const isToday = selectedDate === todayStr;
  const selected = new Date(selectedDate);
  const dayOfMonth = selected.getDate();
  const isPast = selectedDate < todayStr;

  const handleComplete = (habitId: number, day: number, wasCompleted: boolean) => {
    onToggle(habitId, day);
    if (!wasCompleted && isToday) {
      onCompleted?.();
    }
  };

  return (
    <div className="habit-grid">
      {habits.map((habit) => {
        const dayIndex = dayOfMonth - 1;
        const isCompleted = habit.records[dayIndex] === true;
        const isPending = pendingRecordKeys.has(`${habit.id}-${dayIndex + 1}`);
        const status = getDayStatus(isCompleted, isToday, isPast);
        const missedLabel = getRecentMissedLabel(habit);

        return (
          <div key={habit.id} className="habit-card">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: `${habit.color}22` }}
              >
                {habit.icon}
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <HabitName name={habit.name} />
                  <span className={`${statusBadgeClass(status.label)} shrink-0`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {habit.stats.currentStreak}d · {habit.stats.percentage}% this month
                </p>
                {missedLabel && (
                  <p className="mt-0.5 text-xs text-orange-600 dark:text-orange-400">{missedLabel}</p>
                )}
              </div>
            </div>

            {isToday && (
              <div className="mt-auto flex justify-end pt-3">
                {isPending ? (
                  <div className="flex h-9 w-28 items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                  </div>
                ) : isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleComplete(habit.id, dayIndex + 1, true)}
                    className="btn-undo h-9 px-4 text-sm"
                  >
                    ↩ Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleComplete(habit.id, dayIndex + 1, false)}
                    className="btn-primary h-9 px-4 text-sm"
                  >
                    ✓ Complete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
