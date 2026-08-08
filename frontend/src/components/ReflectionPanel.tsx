import { useState, useEffect } from 'react';
import type { Reflection } from '../types';
import { Smile, Meh, Frown } from 'lucide-react';

interface Props {
  reflection: Reflection | null;
  yesterday: Reflection | null;
  dateStr: string;
  onSave: (r: Partial<Reflection>) => void;
}

export default function ReflectionPanel({ reflection, yesterday, dateStr, onSave }: Props) {
  const [mood, setMood] = useState<string | null>(reflection?.mood ?? null);
  const [energy, setEnergy] = useState(reflection?.energy ?? 5);
  const [remarks, setRemarks] = useState(reflection?.remarks ?? '');
  const [tomorrowFocus, setTomorrowFocus] = useState(reflection?.tomorrowFocus ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMood(reflection?.mood ?? null);
    setEnergy(reflection?.energy ?? 5);
    setRemarks(reflection?.remarks ?? '');
    setTomorrowFocus(reflection?.tomorrowFocus ?? '');
  }, [reflection]);

  const handleSave = async () => {
    await onSave({ mood: mood as 'happy' | 'neutral' | 'sad' | undefined, energy, remarks, tomorrowFocus });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isToday = dateStr === new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {yesterday?.remarks && (
        <div className="mb-4 rounded-lg bg-blue-50/50 border border-blue-100 p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Yesterday's reflection</p>
          <p className="text-sm text-gray-700">{yesterday.remarks}</p>
          {yesterday.tomorrowFocus && (
            <p className="mt-1 text-xs text-gray-500">Focus: {yesterday.tomorrowFocus}</p>
          )}
        </div>
      )}

      <h2 className="mb-4 text-sm font-medium text-gray-500">
        {isToday ? "Today's reflection" : `Reflection for ${dateStr}`}
      </h2>

      <div className="mb-4">
        <label className="mb-2 block text-xs text-gray-400">Mood</label>
        <div className="flex gap-2">
          {[
            { key: 'happy', icon: Smile, label: 'Good' },
            { key: 'neutral', icon: Meh, label: 'Okay' },
            { key: 'sad', icon: Frown, label: 'Low' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMood(key)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-2 transition ${
                mood === key
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className={mood === key ? 'text-gray-900' : 'text-gray-400'} />
              <span className="text-[11px] text-gray-500">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs text-gray-400">
          Energy — <span className="tabular-nums">{energy}</span>/10
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="w-full accent-gray-900"
        />
      </div>

      <div className="mb-3">
        <label className="mb-2 block text-xs text-gray-400">Today's remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="What happened today?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 resize-y min-h-[80px]"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs text-gray-400">Tomorrow's focus</label>
        <input
          type="text"
          value={tomorrowFocus}
          onChange={(e) => setTomorrowFocus(e.target.value)}
          placeholder="What will you focus on tomorrow?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Save reflection
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved!</span>}
      </div>
    </div>
  );
}
