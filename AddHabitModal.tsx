import { useState } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';

interface HabitPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
}

interface SelectedHabit {
  preset: HabitPreset | null;
  name: string;
  icon: string;
  color: string;
  category: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (habits: Array<{ name: string; category?: string; icon: string; color: string }>) => Promise<void>;
}

const PRESET_HABITS: HabitPreset[] = [
  { id: 'reading', name: 'Reading', icon: '📖', color: '#3b82f6', category: 'daily' },
  { id: 'coding', name: 'Coding', icon: '💻', color: '#8b5cf6', category: 'daily' },
  { id: 'exercise', name: 'Exercise', icon: '💪', color: '#ef4444', category: 'daily' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', color: '#f59e0b', category: 'daily' },
  { id: 'water', name: 'Drink Water', icon: '💧', color: '#06b6d4', category: 'daily' },
  { id: 'sleep', name: 'Sleep Early', icon: '🛌', color: '#6366f1', category: 'daily' },
  { id: 'journal', name: 'Journal', icon: '📝', color: '#10b981', category: 'daily' },
  { id: 'study', name: 'Study', icon: '📚', color: '#f97316', category: 'daily' },
  { id: 'walking', name: 'Walking', icon: '🚶', color: '#84cc16', category: 'daily' },
  { id: 'no-social', name: 'No Social Media', icon: '📵', color: '#ec4899', category: 'daily' },
  { id: 'stretch', name: 'Stretch', icon: '🌿', color: '#22c55e', category: 'daily' },
  { id: 'gratitude', name: 'Gratitude', icon: '🙏', color: '#eab308', category: 'daily' },
];

const colorOptions = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#6366f1', '#10b981', '#f97316'];
const iconOptions = ['📖', '💻', '💪', '🧘', '💧', '🛌', '📝', '📚', '🚶', '📵', '🌿', '🙏', '🎯', '🔥', '✨', '⭐'];

type Stage = 'select' | 'customize';

export default function AddHabitModal({ open, onClose, onCreate }: Props) {
  const [stage, setStage] = useState<Stage>('select');
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [customHabit, setCustomHabit] = useState<SelectedHabit>({
    preset: null,
    name: '',
    icon: '🎯',
    color: '#3b82f6',
    category: 'daily',
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setStage('select');
    setSelectedPresets(new Set());
    setCustomHabit({ preset: null, name: '', icon: '🎯', color: '#3b82f6', category: 'daily' });
    setShowCustomForm(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const togglePreset = (presetId: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(presetId)) {
        next.delete(presetId);
      } else {
        next.add(presetId);
      }
      return next;
    });
  };

  const handleAddPresets = () => {
    if (selectedPresets.size === 0) return;
    setSaving(true);
    setError('');

    const habitsToCreate = Array.from(selectedPresets).map((presetId) => {
      const preset = PRESET_HABITS.find((p) => p.id === presetId)!;
      return {
        name: preset.name,
        category: preset.category,
        icon: preset.icon,
        color: preset.color,
      };
    });

    onCreate(habitsToCreate)
      .then(() => {
        handleClose();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to create habits.');
        setSaving(false);
      });
  };

  const handleAddCustom = () => {
    const name = customHabit.name.trim();
    if (!name || name.length > 20) {
      setError('Habit name is required (20 characters max).');
      return;
    }

    setSaving(true);
    setError('');

    onCreate([{
      name,
      category: customHabit.category,
      icon: customHabit.icon,
      color: customHabit.color,
    }])
      .then(() => {
        handleClose();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to create habit.');
        setSaving(false);
      });
  };

  if (!open) return null;

  const totalSelected = selectedPresets.size + (showCustomForm && customHabit.name.trim() ? 1 : 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-0 sm:py-6"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-container">
        {/* Fixed Header */}
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {stage === 'select' ? 'Add habits' : 'Customize'}
            </h2>
            <button
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Stage indicator */}
          {stage === 'select' && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {totalSelected > 0
                ? `${totalSelected} habit${totalSelected > 1 ? 's' : ''} selected`
                : 'Pick presets or add one'}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="modal-content">
          {stage === 'select' && !showCustomForm && (
            <>
              {/* Preset habits grid */}
              <div className="preset-grid">
                {PRESET_HABITS.map((preset) => {
                  const isSelected = selectedPresets.has(preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => togglePreset(preset.id)}
                      className={`preset-card ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="preset-icon" style={{ backgroundColor: `${preset.color}18` }}>
                        {preset.icon}
                      </span>
                      <span className="preset-name">{preset.name}</span>
                      {isSelected && (
                        <span className="preset-check">
                          <Check size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
                
                {/* Custom habit card */}
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="preset-card custom"
                >
                  <span className="preset-icon">
                    <Plus size={20} />
                  </span>
                  <span className="preset-name">Custom habit</span>
                </button>
              </div>

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </>
          )}

          {stage === 'select' && showCustomForm && (
            <>
              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomHabit({ preset: null, name: '', icon: '🎯', color: '#3b82f6', category: 'daily' });
                }}
                className="mb-4 text-sm text-indigo-600 dark:text-indigo-400"
              >
                ← Back to presets
              </button>

              {/* Custom habit form */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Habit name</span>
                  <input
                    maxLength={20}
                    value={customHabit.name}
                    onChange={(e) => setCustomHabit((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Learn Spanish"
                    autoFocus
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {iconOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCustomHabit((prev) => ({ ...prev, icon: emoji }))}
                        className={`h-9 w-9 rounded-lg text-lg transition ${
                          customHabit.icon === emoji
                            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomHabit((prev) => ({ ...prev, color: c }))}
                        className={`h-8 w-8 rounded-full transition ${
                          customHabit.color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          {showCustomForm ? (
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customHabit.name.trim() || saving}
              className="btn-primary w-full py-2.5"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Add Custom Habit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddPresets}
              disabled={selectedPresets.size === 0 || saving}
              className="btn-primary w-full py-2.5"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {selectedPresets.size > 0
                ? `Add ${selectedPresets.size} Habit${selectedPresets.size > 1 ? 's' : ''}`
                : 'Select habits to add'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 480px;
          max-height: 90dvh;
          background: white;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @media (min-width: 640px) {
          .modal-container {
            border-radius: 16px;
            max-height: 85vh;
          }
        }

        .modal-header {
          flex-shrink: 0;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .modal-header {
            padding-bottom: calc(16px + env(safe-area-inset-bottom));
          }
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px 100px;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        @media (min-width: 640px) {
          .modal-content {
            padding-bottom: 24px;
          }
        }

        .modal-footer {
          flex-shrink: 0;
          padding: 16px 20px;
          padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: white;
        }

        .dark .modal-footer {
          background: #111114;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        @media (min-width: 480px) {
          .preset-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .preset-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          transition: all 0.15s ease;
          position: relative;
        }

        .dark .preset-card {
          background: #151519;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .preset-card:hover {
          border-color: rgba(0, 0, 0, 0.15);
        }

        .dark .preset-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .preset-card.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .dark .preset-card.selected {
          background: rgba(59, 130, 246, 0.1);
        }

        .preset-card.custom {
          border-style: dashed;
        }

        .preset-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.05);
          font-size: 20px;
        }

        .dark .preset-icon {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
        }

        .preset-name {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          text-align: center;
          line-height: 1.2;
        }

        .dark .preset-name {
          color: #d1d5db;
        }

        .preset-check {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
