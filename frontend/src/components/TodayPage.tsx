import { useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Moon, Plus, Settings, Sun, Download, Upload } from 'lucide-react';
import { storage } from '../lib/storage';
import { useHabits } from '../hooks/useHabits';
import TodayHabits from './TodayHabits';
import TodayProgress from './TodayProgress';
import MonthlyTracker from './MonthlyTracker';
import Insights from './Insights';
import ReflectionPanel from './ReflectionPanel';
import AddHabitModal from './AddHabitModal';
import SectionCard from './SectionCard';
import Toast from './Toast';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromDateString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateStr: string, days: number) {
  const date = fromDateString(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export default function TodayPage({ theme, onToggleTheme }: Props) {
  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const selected = fromDateString(selectedDate);
  const year = selected.getFullYear();
  const month = selected.getMonth() + 1;
  const [showAddModal, setShowAddModal] = useState(false);
  const [backupAction, setBackupAction] = useState<'export' | 'import' | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    reflection,
    yesterdayReflection,
    loading,
    error,
    pendingRecordKeys,
    savingReflection,
    toggleRecord,
    saveReflection,
    refresh,
  } = useHabits(year, month, selectedDate);

  const readableDate = (() => {
    if (selectedDate === today) return 'Today';
    const yesterday = addDays(today, -1);
    if (selectedDate === yesterday) return 'Yesterday';
    return selected.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  })();

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

  const handleExportBackup = async () => {
    setBackupAction('export');
    try {
      const backup = await storage.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `habit-tracker-backup-${today}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast('Backup exported');
    } catch {
      showToast('Failed to export backup', 'error');
    } finally {
      setBackupAction(null);
      setShowSettingsMenu(false);
    }
  };

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return;
    setBackupAction('import');
    try {
      const backup = JSON.parse(await file.text());
      await storage.importBackup(backup);
      await refresh();
      showToast('Backup imported');
    } catch {
      showToast('Failed to import backup', 'error');
    } finally {
      setBackupAction(null);
      setShowSettingsMenu(false);
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const navigateDay = (dir: number) => {
    const next = addDays(selectedDate, dir);
    if (next <= today) {
      setSelectedDate(next);
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
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm text-indigo-600 underline dark:text-indigo-400">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isToday = selectedDate === today;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 dark:bg-[#0a0a0b] dark:text-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0b]/95 sm:px-4 sm:py-3 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#151519]">
              <button
                onClick={() => navigateDay(-1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 dark:hover:bg-[#1f1f24]"
                title="Previous day"
              >
                <ChevronLeft size={16} />
              </button>
              <span
                className={`min-w-[5rem] px-2 text-center text-sm font-semibold ${
                  isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {readableDate}
              </span>
              <button
                onClick={() => navigateDay(1)}
                disabled={isToday}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30 dark:hover:bg-[#1f1f24]"
                title="Next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
              >
                <Calendar size={14} /> Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary h-9 px-4"
              title="Add Habit"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Habit</span>
            </button>

            <div ref={settingsMenuRef} className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-[#151519] dark:hover:bg-[#1f1f24]"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[168px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a1a1f]">
                  <button
                    onClick={() => {
                      onToggleTheme();
                      setShowSettingsMenu(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-[#252529]"
                  >
                    {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                  <button
                    onClick={handleExportBackup}
                    disabled={backupAction !== null}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-[#252529]"
                  >
                    {backupAction === 'export' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    Export backup
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    disabled={backupAction !== null}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-[#252529]"
                  >
                    {backupAction === 'import' ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    Import backup
                  </button>
                </div>
              )}
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => handleImportBackup(event.target.files?.[0])}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-4 sm:py-10 lg:px-8">
        {data && (
          <>
            {data.habits.length === 0 ? (
              <div className="py-10 text-center sm:py-16">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                  What do I need to do today?
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add your first habit to get started</p>
                <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary mt-6">
                  <Plus size={16} /> Add Habit
                </button>
              </div>
            ) : (
              <div className="space-y-10 sm:space-y-16">
                {/* Today */}
                <div>
                  <div className="mb-5 sm:mb-8">
                    <p className="section-label">Today</p>
                    <h1 className="mt-1.5 sm:mt-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                      What do I need to do today?
                    </h1>
                  </div>
                  <SectionCard
                    title="Today's Habits"
                    subtitle="What you need to do today."
                    variant="today"
                  >
                    <TodayHabits
                      habits={data.habits}
                      selectedDate={selectedDate}
                      pendingRecordKeys={pendingRecordKeys}
                      onToggle={toggleRecord}
                      onCompleted={() => showToast('✓ Completed')}
                    />
                  </SectionCard>
                </div>

                {/* Today's Progress */}
                <SectionCard title="Today's Progress" subtitle="How you're doing so far today.">
                  <TodayProgress habits={data.habits} selectedDate={selectedDate} />
                </SectionCard>

                {/* Monthly History */}
                <SectionCard title="Monthly History" subtitle="Your completion history for this month." variant="history">
                  <MonthlyTracker
                    data={data}
                    selectedDate={selectedDate}
                    pendingRecordKeys={pendingRecordKeys}
                    onToggle={toggleRecord}
                  />
                </SectionCard>

                {/* Insights */}
                <SectionCard title="Insights" subtitle="Quick stats from this month." variant="insights">
                  <Insights data={data} />
                </SectionCard>

                {/* Reflection */}
                <SectionCard title="Today's Reflection" subtitle="This is where you write about your day." variant="journal">
                  <ReflectionPanel
                    reflection={reflection}
                    yesterday={yesterdayReflection}
                    dateStr={selectedDate}
                    saving={savingReflection}
                    onSave={saveReflection}
                    onSaved={() => showToast('Saved ✓')}
                  />
                </SectionCard>
              </div>
            )}
          </>
        )}

        <AddHabitModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreate={handleCreateHabits} />
      </main>
    </div>
  );
}
