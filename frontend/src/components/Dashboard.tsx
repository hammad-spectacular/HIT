import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../hooks/useAuth';
import OverallProgress from './OverallProgress';
import HabitList from './HabitList';
import MonthlyTracker from './MonthlyTracker';
import ReflectionPanel from './ReflectionPanel';

export default function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, reflection, yesterdayReflection, loading, error, toggleRecord, saveReflection } = useHabits(year, month);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{monthName}</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              setYear(now.getFullYear());
              setMonth(now.getMonth() + 1);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Today
          </button>
          <button onClick={() => navigateMonth(1)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
            <ChevronRight size={18} />
          </button>
          <button onClick={logout} className="ml-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 text-gray-500">
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
        </>
      )}
    </div>
  );
}
