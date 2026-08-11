import type { Habit, MonthData } from '../types';

export interface MonthlyReviewHabit {
  id: number;
  name: string;
  icon: string;
  percentage: number;
}

export interface MonthlyReviewData {
  monthLabel: string;
  bestHabit: MonthlyReviewHabit | null;
  needsAttention: MonthlyReviewHabit | null;
  biggestImprovement: (MonthlyReviewHabit & { delta: number }) | null;
  focusRecommendation: string;
}

function getActiveDaysInMonth(
  createdAt: string | undefined,
  year: number,
  month: number,
  endDay: number,
): number {
  if (!createdAt) return endDay;

  const created = new Date(createdAt);
  const cy = created.getFullYear();
  const cm = created.getMonth() + 1;
  const cd = created.getDate();

  if (cy > year || (cy === year && cm > month)) return 0;

  const startDay = cy === year && cm === month ? cd : 1;
  return Math.max(0, endDay - startDay + 1);
}

function getStartDayInMonth(createdAt: string | undefined, year: number, month: number): number {
  if (!createdAt) return 1;
  const created = new Date(createdAt);
  if (created.getFullYear() === year && created.getMonth() + 1 === month) {
    return created.getDate();
  }
  return 1;
}

export function getHabitCompletionRate(
  habit: Habit,
  year: number,
  month: number,
  endDay: number,
): { rate: number; activeDays: number; completed: number } {
  const activeDays = getActiveDaysInMonth(habit.createdAt, year, month, endDay);
  if (activeDays === 0) return { rate: -1, activeDays: 0, completed: 0 };

  const startDay = getStartDayInMonth(habit.createdAt, year, month);
  const slice = habit.records.slice(startDay - 1, endDay);
  const completed = slice.filter(Boolean).length;
  const rate = Math.round((completed / activeDays) * 100);

  return { rate, activeDays, completed };
}

function isEligibleForRanking(activeDays: number, endDay: number): boolean {
  const threshold = Math.min(5, Math.max(3, Math.floor(endDay * 0.4)));
  return activeDays >= threshold;
}

function generateFocus(habit: MonthlyReviewHabit | null): string {
  if (!habit) {
    return 'Keep building your habits — consistency matters more than perfection.';
  }
  if (habit.percentage >= 80) {
    return `Great work on "${habit.name}"! Focus on maintaining your momentum next month.`;
  }
  const targetPerWeek = habit.percentage < 25 ? 3 : habit.percentage < 50 ? 4 : 5;
  return `You completed "${habit.name}" ${habit.percentage}% of the time. Try completing it at least ${targetPerWeek} times per week next month.`;
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function toReviewHabit(habit: Habit, rate: number): MonthlyReviewHabit {
  return { id: habit.id, name: habit.name, icon: habit.icon, percentage: rate };
}

export function computeMonthlyReview(current: MonthData, previous: MonthData | null): MonthlyReviewData {
  const { year, month, currentDay } = current.meta;

  const ranked = current.habits
    .map((habit) => {
      const { rate, activeDays } = getHabitCompletionRate(habit, year, month, currentDay);
      return { habit, rate, activeDays, eligible: rate >= 0 && isEligibleForRanking(activeDays, currentDay) };
    })
    .filter((entry) => entry.eligible);

  const bestEntry = ranked.length > 0
    ? ranked.reduce((best, entry) => (entry.rate > best.rate ? entry : best))
    : null;

  const attentionCandidates = ranked.filter((entry) => entry.rate < 100);
  const attentionEntry = attentionCandidates.length > 0
    ? attentionCandidates.reduce((lowest, entry) => (entry.rate < lowest.rate ? entry : lowest))
    : null;

  let biggestImprovement: (MonthlyReviewHabit & { delta: number }) | null = null;

  if (previous) {
    const { year: prevYear, month: prevMonth, daysInMonth: prevEndDay } = previous.meta;
    let maxDelta = 0;

    for (const habit of current.habits) {
      const prevHabit = previous.habits.find((h) => h.id === habit.id);
      if (!prevHabit) continue;

      const currentStats = getHabitCompletionRate(habit, year, month, currentDay);
      const prevStats = getHabitCompletionRate(prevHabit, prevYear, prevMonth, prevEndDay);

      if (
        currentStats.rate < 0 ||
        prevStats.rate < 0 ||
        !isEligibleForRanking(currentStats.activeDays, currentDay) ||
        !isEligibleForRanking(prevStats.activeDays, prevEndDay)
      ) {
        continue;
      }

      const delta = currentStats.rate - prevStats.rate;
      if (delta > maxDelta) {
        maxDelta = delta;
        biggestImprovement = { ...toReviewHabit(habit, currentStats.rate), delta };
      }
    }
  }

  const needsAttention =
    attentionEntry && attentionEntry.rate < 80
      ? toReviewHabit(attentionEntry.habit, attentionEntry.rate)
      : null;

  const focusTarget =
    needsAttention ??
    (attentionEntry ? toReviewHabit(attentionEntry.habit, attentionEntry.rate) : null);

  return {
    monthLabel: monthLabel(year, month),
    bestHabit: bestEntry ? toReviewHabit(bestEntry.habit, bestEntry.rate) : null,
    needsAttention,
    biggestImprovement,
    focusRecommendation: generateFocus(focusTarget),
  };
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}
