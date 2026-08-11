import { useState } from 'react';
import { Plus } from 'lucide-react';
import { storage } from '../lib/storage';
import { useHabits } from '../hooks/useHabits';
import HabitList from './HabitList';
import AddHabitModal from './AddHabitModal';
import SectionCard from './SectionCard';
import Toast from './Toast';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function HabitsPage(_props: Props) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const {
    data,
    loading,
    error,
    deletingHabitIds,
    archiveHabit,
    deleteHabit,
    refresh,
  } = useHabits(year, month, todayStr);

  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateHabits = async (habits: Array<{ name: string; category?: string; icon: string; color: string }>) => {
    await Promise.all(habits.map((habit) => storage.createHabit(habit)));
    setShowAddModal(false);
    await refresh();
    showToast('Habit created ✓');
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
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 dark:bg-[#0a0a0b] dark:text-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0b]/95 sm:px-4 sm:py-3 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Habits</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Create and manage your habits.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary h-9 px-4"
            title="Add Habit"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-4 sm:py-10 lg:px-8">
        {data && (
          <SectionCard title="Your Habits" subtitle="Manage your habit list." variant="manage">
            <HabitList
              habits={data.habits}
              deletingHabitIds={deletingHabitIds}
              onArchive={archiveHabit}
              onDelete={deleteHabit}
              onArchived={() => showToast('Habit archived')}
              onDeleted={() => showToast('Habit deleted')}
            />
          </SectionCard>
        )}

        <AddHabitModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreate={handleCreateHabits} />
      </main>
    </div>
  );
}
