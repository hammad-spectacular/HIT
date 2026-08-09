import { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface HabitForm {
  name: string;
  category?: string;
  icon: string;
  color: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (habits: HabitForm[]) => Promise<void>;
}

const defaultHabit: HabitForm = {
  name: '',
  category: '',
  icon: '✅',
  color: '#3b82f6',
};

const emojiOptions = ['✅', '🌿', '🔥', '💪', '🧘', '📈', '🍎', '✨'];
const colorOptions = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AddHabitModal({ open, onClose, onCreate }: Props) {
  const [habits, setHabits] = useState<HabitForm[]>([{ ...defaultHabit }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = habits.every((habit) => habit.name.trim().length > 0);

  const handleFieldChange = (index: number, field: keyof HabitForm, value: string) => {
    setHabits((current) =>
      current.map((habit, idx) => (idx === index ? { ...habit, [field]: value } : habit)),
    );
  };

  const addHabitRow = () => setHabits((current) => [...current, { ...defaultHabit }]);

  const removeHabitRow = (index: number) => {
    if (habits.length === 1) return;
    setHabits((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please give each habit a name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onCreate(habits.map((habit) => ({ ...habit, category: habit.category?.trim() || undefined })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create habits.');
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = useMemo(
    () => emojiOptions.map((emoji) => ({ value: emoji, label: emoji })),
    [],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#121214]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add habits</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create one or more habits at once.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#1f1f24]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {habits.map((habit, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#17171b]">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Habit {index + 1}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Give this habit a name and color.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#111] dark:text-gray-200 dark:hover:bg-[#1f1f24]"
                  onClick={() => removeHabitRow(index)}
                >
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Name
                  <input
                    value={habit.name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleFieldChange(index, 'name', event.target.value)}
                    placeholder="Daily reading"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-[#121214] dark:text-gray-100 dark:focus:border-gray-400"
                  />
                </label>

                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Category
                  <input
                    value={habit.category}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleFieldChange(index, 'category', event.target.value)}
                    placeholder="Health, focus, habits"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-[#121214] dark:text-gray-100 dark:focus:border-gray-400"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleFieldChange(index, 'icon', option.value)}
                        className={`rounded-2xl border px-3 py-2 text-lg transition ${
                          habit.icon === option.value
                            ? 'border-gray-900 bg-gray-100 dark:border-gray-100 dark:bg-[#1f1f24]'
                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-[#121214]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleFieldChange(index, 'color', color)}
                        className={`h-10 w-10 rounded-full border transition ${
                          habit.color === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addHabitRow}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#111] dark:text-gray-200 dark:hover:bg-[#1f1f24]"
          >
            <Plus size={16} /> Add another habit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create habits'}
          </button>
        </div>
      </div>
    </div>
  );
}
