import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { MonthData, Reflection } from '../types';

export function useHabits(year: number, month: number) {
  const [data, setData] = useState<MonthData | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [yesterdayReflection, setYesterdayReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${
    data?.meta.isCurrentMonth ? String(data.meta.currentDay).padStart(2, '0') : String(data?.meta.daysInMonth ?? 1).padStart(2, '0')
  }`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [monthData, refl, yest] = await Promise.all([
        api.habits.month(year, month),
        api.reflections.get(dateStr),
        api.reflections.yesterday(dateStr),
      ]);
      setData(monthData);
      setReflection(refl);
      setYesterdayReflection(yest);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [year, month, dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleRecord = useCallback(async (habitId: number, day: number) => {
    if (!data) return;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newCompleted = !habit.records[day - 1];
    await api.habits.record(habitId, date, newCompleted);

    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const h = updated.habits.find((h) => h.id === habitId)!;
      h.records[day - 1] = newCompleted;
      const relevant = h.records.slice(0, updated.meta.currentDay);
      const done = relevant.filter(Boolean).length;
      h.stats = {
        completed: done,
        missed: updated.meta.currentDay - done,
        percentage: Math.round((done / updated.meta.currentDay) * 100),
        currentStreak: calcStreak(relevant).current,
        longestStreak: calcStreak(relevant).longest,
      };
      return updated;
    });
  }, [data, year, month]);

  const saveReflection = useCallback(async (r: Partial<Reflection>) => {
    const payload = { ...r, date: dateStr };
    await api.reflections.save(payload);
    setReflection((prev) => ({ ...prev, ...payload } as Reflection));
  }, [dateStr]);

  return { data, reflection, yesterdayReflection, loading, error, toggleRecord, saveReflection, refresh: fetchData };
}

function calcStreak(records: boolean[]) {
  let current = 0;
  let longest = 0;
  let run = 0;
  for (const done of records) {
    if (done) { run++; longest = Math.max(longest, run); }
    else { run = 0; }
  }
  for (let i = records.length - 1; i >= 0 && records[i]; i--) current++;
  return { current, longest };
}
