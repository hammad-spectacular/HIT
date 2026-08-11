import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import MonthlyReview from './MonthlyReview';
import SectionCard from './SectionCard';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGoToToday: () => void;
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonths(dateStr: string, months: number) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + months);
  return toDateString(date);
}

export default function ReviewPage({ theme, onToggleTheme, onGoToToday }: Props) {
  const today = new Date();
  const todayStr = toDateString(today);

  const [selectedMonth, setSelectedMonth] = useState(todayStr.substring(0, 7)); // YYYY-MM

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-01`;
  }, [selectedMonth]);

  const year = parseInt(selectedMonth.split('-')[0]);
  const month = parseInt(selectedMonth.split('-')[1]);

  const { data, loading, error } = useHabits(year, month, selectedDate);

  const monthLabel = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const navigateMonth = (dir: number) => {
    const next = addMonths(selectedDate, dir);
    const nextMonth = next.substring(0, 7);
    const [ny, nm] = nextMonth.split('-').map(Number);
    const nextDate = new Date(ny, nm - 1, 1);
    if (nextDate <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setSelectedMonth(nextMonth);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 dark:bg-[#0a0a0b] dark:text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0b]/95 sm:px-4 sm:py-3 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
          {/* Mobile: back to Today button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onGoToToday}
              className="flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 sm:hidden"
              title="Back to Today"
            >
              <ChevronLeft size={18} />
              <span>Today</span>
            </button>

            {/* Desktop: page title */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Review</h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Monthly analysis and insights.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Month navigator */}
            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#151519]">
              <button
                onClick={() => navigateMonth(-1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 dark:hover:bg-[#1f1f24]"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[10rem] px-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                {monthLabel}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                disabled={selectedMonth === todayStr.substring(0, 7)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30 dark:hover:bg-[#1f1f24]"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={onToggleTheme}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-[#151519] dark:hover:bg-[#1f1f24]"
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-4 sm:py-10 lg:px-8">
        {data && (
          <SectionCard
            title="Monthly Review"
            subtitle="What to celebrate, fix, and focus on next."
            variant="review"
          >
            <MonthlyReview year={year} month={month} />
          </SectionCard>
        )}
      </main>
    </div>
  );
}
