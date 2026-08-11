import type { Habit } from '../types';

export function getRecentMissedLabel(habit: Habit, windowSize = 7): string | null {
  const relevant = habit.records.filter((_, i) => i < habit.records.length);
  const slice = relevant.slice(-windowSize);
  if (slice.length === 0) return null;

  const missed = slice.filter((r) => !r).length;
  if (missed === 0) return null;

  return `Missed ${missed} of the last ${slice.length} days`;
}

export function getDayStatus(
  isCompleted: boolean,
  isToday: boolean,
  isPast: boolean,
): { label: string; symbol: string } {
  if (isCompleted) return { label: 'Completed', symbol: '✓' };
  if (isToday) return { label: 'Pending', symbol: '○' };
  if (isPast) return { label: 'Missed', symbol: '×' };
  return { label: 'Not scheduled', symbol: '—' };
}
