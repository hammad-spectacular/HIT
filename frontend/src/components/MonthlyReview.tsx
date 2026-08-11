import { useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { computeMonthlyReview, getPreviousMonth, type MonthlyReviewData } from '../lib/monthlyReview';

interface Props {
  year: number;
  month: number;
}

export default function MonthlyReview({ year, month }: Props) {
  const [review, setReview] = useState<MonthlyReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [current, prevCoords] = await Promise.all([
          storage.getMonth(year, month),
          Promise.resolve(getPreviousMonth(year, month)),
        ]);
        const previous = await storage.getMonth(prevCoords.year, prevCoords.month);
        if (!cancelled) {
          setReview(computeMonthlyReview(current, previous));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{review.monthLabel}</p>

      {review.bestHabit && (
        <div className="review-item">
          <p className="review-item-label">🏆 Best habit</p>
          <p className="review-item-value">{review.bestHabit.name}</p>
          <p className="review-item-sub">{review.bestHabit.percentage}% completion</p>
        </div>
      )}

      {review.needsAttention ? (
        <div className="review-item review-item-warn">
          <p className="review-item-label">⚠ Needs attention</p>
          <p className="review-item-value">{review.needsAttention.name}</p>
          <p className="review-item-sub">{review.needsAttention.percentage}% completion</p>
        </div>
      ) : (
        <div className="review-item">
          <p className="review-item-label">⚠ Needs attention</p>
          <p className="review-item-value text-emerald-600 dark:text-emerald-400">All on track</p>
          <p className="review-item-sub">Every active habit is above 80%</p>
        </div>
      )}

      <div className="review-item review-item-focus">
        <p className="review-item-label">🎯 Focus for next month</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{review.focusRecommendation}</p>
      </div>

      {review.biggestImprovement ? (
        <div className="review-item">
          <p className="review-item-label">📈 Biggest improvement</p>
          <p className="review-item-value">{review.biggestImprovement.name}</p>
          <p className="review-item-sub">+{review.biggestImprovement.delta}% from last month</p>
        </div>
      ) : (
        <div className="review-item">
          <p className="review-item-label">📈 Biggest improvement</p>
          <p className="review-item-sub">Not enough history yet — check back next month.</p>
        </div>
      )}
    </div>
  );
}
