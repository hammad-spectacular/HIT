import { useState } from 'react';
import { storage } from '../lib/storage';
import HabitPicker from './HabitPicker';

interface Props {
  onComplete: () => void;
}

export default function LandingPage({ onComplete }: Props) {
  const [step, setStep] = useState<'intro' | 'picker'>('intro');
  const [loading, setLoading] = useState(false);

  const handleAddHabits = async (habits: Array<{ name: string; category?: string; icon: string; color: string }>) => {
    setLoading(true);
    try {
      await Promise.all(habits.map((habit) => storage.createHabit(habit)));
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  if (step === 'picker') {
    return (
      <HabitPicker
        onAdd={handleAddHabits}
        onBack={() => setStep('intro')}
        loading={loading}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Hero artwork — the "still standing." black-and-white illustration */}
      <div className="relative w-full shrink-0 overflow-hidden" style={{ height: '55vh', minHeight: '320px' }}>
        <img
          src="/landing-artwork.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay so text is readable */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            Habit Tracker
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Still standing.
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Build habits. Keep going.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center px-6 pt-8 pb-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your day.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Watch your streak grow.
            </p>
          </div>

          <button
            onClick={() => setStep('picker')}
            className="btn-primary w-full py-3 text-base"
          >
            Get Started
          </button>

          <button
            onClick={onComplete}
            className="text-sm text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
