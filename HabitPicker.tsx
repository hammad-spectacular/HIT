import { useState } from 'react';
import { ChevronLeft, Loader2, Plus, X } from 'lucide-react';

const PRESET_HABITS = [
  { name: 'Reading', icon: '📖', color: '#2563eb' },
  { name: 'Coding', icon: '💻', color: '#059669' },
  { name: 'Exercise', icon: '💪', color: '#d97706' },
  { name: 'Meditation', icon: '🧘', color: '#7c3aed' },
  { name: 'Writing', icon: '✍️', color: '#db2777' },
  { name: 'Sleep Early', icon: '🛌', color: '#0891b2' },
  { name: 'Water', icon: '💧', color: '#4f46e5' },
  { name: 'Study', icon: '📚', color: '#dc2626' },
];

interface Props {
  onAdd: (habits: Array<{ name: string; category?: string; icon: string; color: string }>) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function HabitPicker({ onAdd, onBack, loading }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('✨');
  const [customColor, setCustomColor] = useState('#2563eb');
  const [showCustom, setShowCustom] = useState(false);
  const [showCustomConfirm, setShowCustomConfirm] = useState(false);
  const [customIndex, setCustomIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddPresets = () => {
    const habits = Array.from(selected).map((i) => PRESET_HABITS[i]);
    onAdd(habits);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const habit = {
      name: customName.trim(),
      icon: customIcon,
      color: customColor,
    };
    onAdd([habit]);
  };

  const handleCustomToggle = (index: number) => {
    setCustomIndex(index);
    const preset = PRESET_HABITS[index];
    setCustomName(preset.name);
    setCustomIcon(preset.icon);
    setCustomColor(preset.color);
    setShowCustom(true);
  };

  const handleCustomConfirm = () => {
    if (customIndex !== null) {
      toggle(customIndex);
    }
    setShowCustom(false);
    setShowCustomConfirm(false);
    setCustomIndex(null);
  };

  const selectedCount = selected.size;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col bg-gray-50 dark:bg-[#0a0a0b]">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4">
          <div className="mx-auto max-w-md flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Choose habits</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pick what to track.</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <div className="mx-auto max-w-md">
            {/* Preset grid */}
            <div className="mb-6 grid grid-cols-2 gap-3">
          {PRESET_HABITS.map((habit, index) => {
            const isSelected = selected.has(index);
            const isCustomizing = showCustom && customIndex === index;
            return (
              <button
                key={habit.name}
                onClick={() => toggle(index)}
                onDoubleClick={() => handleCustomToggle(index)}
                className={`relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-[#141418] dark:hover:border-gray-600'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`mb-3 flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400'
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-[#1a1a1f]'
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <span className="mb-2 text-2xl">{habit.icon}</span>

                {/* Name */}
                <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {habit.name}
                </span>

                {/* Edit hint */}
                <span className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">double-tap = edit</span>

                {/* Customize overlay */}
                {isCustomizing && (
                  <div className="absolute inset-0 z-10 flex flex-col rounded-xl bg-white/95 p-3 dark:bg-[#1a1a1f]/95">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Customize</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCustom(false); setCustomIndex(null); }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={20}
                      className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-[#252529] dark:text-white"
                      placeholder="Habit name"
                    />
                    <div className="mb-2 flex flex-wrap gap-1">
                      {['✨', '🎯', '🌿', '🔥', '💪', '📈', '🍎', '✅'].map((e) => (
                        <button
                          key={e}
                          onClick={(e) => { e.stopPropagation(); setCustomIcon(e); }}
                          className={`h-7 w-7 rounded-md text-sm ${customIcon === e ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'].map((c) => (
                        <button
                          key={c}
                          onClick={(e) => { e.stopPropagation(); setCustomColor(c); }}
                          className={`h-6 w-6 rounded-full ${customColor === c ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-[#1a1a1f]' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCustomConfirm(); }}
                      className="btn-primary mt-auto w-full py-1.5 text-xs"
                    >
                      Done
                    </button>
                  </div>
                )}
              </button>
            );
          })}

            {/* Create custom */}
            <button
              onClick={() => { setCustomName(''); setCustomIcon('✨'); setCustomColor('#2563eb'); setShowCustom(true); setShowCustomConfirm(true); }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-gray-400 transition hover:border-gray-400 hover:text-gray-600 dark:border-gray-700 dark:bg-[#141418] dark:text-gray-500 dark:hover:border-gray-600"
            >
              <Plus size={20} className="mb-1" />
              <span className="text-sm font-medium">Custom</span>
            </button>
          </div>

            {/* Custom habit form */}
            {showCustom && showCustomConfirm && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#141418]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">New habit</span>
                  <button
                    onClick={() => { setShowCustom(false); setShowCustomConfirm(false); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  maxLength={20}
                  className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-[#1a1a1f] dark:text-white"
                  placeholder="Habit name"
                  autoFocus
                />
                <div className="mb-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">Icon</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['✨', '🎯', '🌿', '🔥', '💪', '📈', '🍎', '✅', '📖', '💻', '🧘', '✍️'].map((e) => (
                      <button
                        key={e}
                        onClick={() => setCustomIcon(e)}
                        className={`h-8 w-8 rounded-lg text-base ${customIcon === e ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">Color</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCustomColor(c)}
                        className={`h-7 w-7 rounded-full ${customColor === c ? 'ring-2 ring-gray-400 ring-offset-1 dark:ring-offset-[#141418]' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                  <button
                    onClick={handleCustomConfirm}
                    disabled={!customName.trim()}
                    className="btn-primary mt-4 w-full py-2 text-sm"
                  >
                    Add habit
                  </button>
              </div>
            )}

            {/* Selected count */}
            {selectedCount > 0 && (
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {selectedCount} selected
              </p>
            )}

            {selectedCount === 0 && !showCustom && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                Pick habits or add your own
              </p>
            )}
          </div>
        </div>

        {/* Sticky bottom action area */}
        <div className="flex-shrink-0 border-t border-gray-200/80 bg-white px-4 py-4 dark:border-gray-800 dark:bg-[#111114]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
          <div className="mx-auto max-w-md">
            {/* Add button */}
            {selectedCount > 0 && (
              <button
                onClick={handleAddPresets}
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  `Add ${selectedCount} Habit${selectedCount > 1 ? 's' : ''}`
                )}
              </button>
            )}

            {selectedCount === 0 && !showCustom && (
              <button
                disabled
                className="btn-primary w-full py-3 text-base opacity-50 cursor-not-allowed"
              >
                Select to continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
