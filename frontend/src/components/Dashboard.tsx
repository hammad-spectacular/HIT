import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Moon, Plus, Sun } from 'lucide-react';
import { api } from '../lib/api';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../hooks/useAuth';
import OverallProgress from './OverallProgress';
import HabitList from './HabitList';
import MonthlyTracker from './MonthlyTracker';
import ReflectionPanel from './ReflectionPanel';
import AddHabitModal from './AddHabitModal';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Dashboard({ theme, onToggleTheme }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, reflection, yesterdayReflection, loading, error, toggleRecord, saveReflection, refresh } = useHabits(year, month);
  const { logout, user } = useAuth();

  const monthName = useMemo(() => {
    return new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [year, month]);

  const navigateMonth = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setYear(newYear);
    setMonth(newMonth);
  };

  const handleCreateHabits = async (habits: Array<{ name: string; category?: string; icon: string; color: string }>) => {
    await Promise.all(habits.map((habit) => api.habits.create(habit)));
    setShowAddModal(false);
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm underline text-gray-900 dark:text-gray-100">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24 bg-gray-50 min-h-screen dark:bg-[#0a0a0b]">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{monthName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#17171b] dark:text-gray-200 dark:hover:bg-[#1f1f24]"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#17171b] dark:text-gray-200 dark:hover:bg-[#1f1f24]">
            <Plus size={16} /> Add habits
          </button>
          <button onClick={() => navigateMonth(-1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#1f1f24]">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              setYear(now.getFullYear());
              setMonth(now.getMonth() + 1);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#1f1f24]"
          >
            Today
          </button>
          <button onClick={() => navigateMonth(1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#1f1f24]">
            <ChevronRight size={18} />
          </button>
          <button onClick={logout} className="ml-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 text-gray-500 dark:border-gray-700 dark:hover:bg-[#1f1f24] dark:text-gray-300">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {data && (
        <>
          <OverallProgress data={data} />
          <HabitList habits={data.habits} />
          <MonthlyTracker data={data} onToggle={toggleRecord} />
          <ReflectionPanel
            reflection={reflection}
            yesterday={yesterdayReflection}
            dateStr={data.meta.isCurrentMonth
              ? `${year}-${String(month).padStart(2, '0')}-${String(data.meta.currentDay).padStart(2, '0')}`
              : `${year}-${String(month).padStart(2, '0')}-01`}
            onSave={saveReflection}
          />
          <AddHabitModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreate={handleCreateHabits} />
        </>
      )}
    </div>
  );
}
