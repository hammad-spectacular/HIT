import type { Habit, MonthData, Reflection } from '../types';

export interface LocalHabit {
  id: number;
  name: string;
  category: string | null;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface LocalHabitRecord {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
  completedAt: string | null;
}

export interface LocalDailyReflection {
  id: number;
  date: string;
  mood: 'happy' | 'neutral' | 'sad' | null;
  energy: number | null;
  remarks: string | null;
  tomorrowFocus: string | null;
  createdAt: string;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  habits: LocalHabit[];
  habitRecords: LocalHabitRecord[];
  dailyReflections: LocalDailyReflection[];
}

const DB_NAME = 'habit-tracker-local';
const DB_VERSION = 1;
const HABIT_NAME_LIMIT = 20;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('habits')) {
        const store = db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
        store.createIndex('displayOrder', 'displayOrder');
      }

      if (!db.objectStoreNames.contains('habitRecords')) {
        const store = db.createObjectStore('habitRecords', { keyPath: 'id', autoIncrement: true });
        store.createIndex('habitId_date', ['habitId', 'date'], { unique: true });
        store.createIndex('habitId', 'habitId');
        store.createIndex('date', 'date');
      }

      if (!db.objectStoreNames.contains('dailyReflections')) {
        const store = db.createObjectStore('dailyReflections', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function promisify<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  return promisify<T[]>(tx.objectStore(storeName).getAll());
}

function waitForTransaction(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function todayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function calcStreak(records: boolean[]) {
  let current = 0;
  let longest = 0;
  let run = 0;

  for (const done of records) {
    if (done) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  for (let i = records.length - 1; i >= 0 && records[i]; i--) current++;
  return { current, longest };
}

function calcOverallStreak(allRecords: boolean[][]) {
  if (allRecords.length === 0) return { current: 0, longest: 0 };

  const days = allRecords[0].length;
  const dailyComplete = Array.from({ length: days }, (_, day) =>
    allRecords.every((records) => records[day]),
  );

  return calcStreak(dailyComplete);
}

function normalizeHabit(input: { name: string; category?: string | null; icon?: string; color?: string }, displayOrder: number): Omit<LocalHabit, 'id'> {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Habit name is required.');
  }

  if (name.length > HABIT_NAME_LIMIT) {
    throw new Error('Habit names must be 20 characters or fewer.');
  }

  return {
    name,
    category: input.category?.trim() || null,
    icon: input.icon?.trim() || '✅',
    color: input.color || '#2563eb',
    displayOrder,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export const storage = {
  async createHabit(input: { name: string; category?: string | null; icon?: string; color?: string }) {
    const habits = await getAll<LocalHabit>('habits');
    const nextOrder = habits.length ? Math.max(...habits.map((habit) => habit.displayOrder)) + 1 : 0;
    const habit = normalizeHabit(input, nextOrder);
    const db = await openDb();
    const tx = db.transaction('habits', 'readwrite');
    const request = tx.objectStore('habits').add(habit);
    const id = await promisify<IDBValidKey>(request);
    await waitForTransaction(tx);
    return { id: Number(id), ...habit } as LocalHabit;
  },

  async archiveHabit(id: number) {
    const habits = await getAll<LocalHabit>('habits');
    const habit = habits.find((h) => h.id === id);
    if (!habit) throw new Error('Habit not found.');

    const db = await openDb();
    const tx = db.transaction('habits', 'readwrite');
    tx.objectStore('habits').put({ ...habit, isActive: false });
    await waitForTransaction(tx);
  },

  async deleteHabit(id: number) {
    const records = (await getAll<LocalHabitRecord>('habitRecords')).filter((record) => record.habitId === id);
    const db = await openDb();
    const tx = db.transaction(['habits', 'habitRecords'], 'readwrite');
    tx.objectStore('habits').delete(id);
    const recordsStore = tx.objectStore('habitRecords');
    records.forEach((record) => recordsStore.delete(record.id));
    await waitForTransaction(tx);
  },

  async saveRecord(habitId: number, date: string, completed: boolean) {
    if (date !== todayString()) {
      throw new Error('Only today can be edited. Past and future habit records are locked.');
    }

    const records = await getAll<LocalHabitRecord>('habitRecords');
    const existing = records.find((record) => record.habitId === habitId && record.date === date);
    const record: Omit<LocalHabitRecord, 'id'> & { id?: number } = {
      ...existing,
      habitId,
      date,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    };

    const db = await openDb();
    const tx = db.transaction('habitRecords', 'readwrite');
    const store = tx.objectStore('habitRecords');
    const id = await promisify<IDBValidKey>(store.put(record));
    await waitForTransaction(tx);
    return { ...record, id: Number(id) } as LocalHabitRecord;
  },

  async getReflection(date: string) {
    const db = await openDb();
    const tx = db.transaction('dailyReflections', 'readonly');
    const reflection = await promisify<LocalDailyReflection | undefined>(tx.objectStore('dailyReflections').index('date').get(date));
    return reflection ?? null;
  },

  async saveReflection(input: { date: string; mood?: string; energy?: number; remarks?: string; tomorrowFocus?: string }) {
    const existing = await this.getReflection(input.date) as LocalDailyReflection | null;
    const reflection: Omit<LocalDailyReflection, 'id'> & { id?: number } = {
      ...existing,
      date: input.date,
      mood: (input.mood as LocalDailyReflection['mood']) ?? existing?.mood ?? null,
      energy: input.energy ?? existing?.energy ?? null,
      remarks: input.remarks ?? existing?.remarks ?? null,
      tomorrowFocus: input.tomorrowFocus ?? existing?.tomorrowFocus ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    const db = await openDb();
    const tx = db.transaction('dailyReflections', 'readwrite');
    const store = tx.objectStore('dailyReflections');
    const id = await promisify<IDBValidKey>(store.put(reflection));
    await waitForTransaction(tx);
    return { ...reflection, id: Number(id) } as Reflection;
  },

  async getMonth(year: number, month: number): Promise<MonthData> {
    const [habits, records] = await Promise.all([
      getAll<LocalHabit>('habits'),
      getAll<LocalHabitRecord>('habitRecords'),
    ]);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
    const activeHabits = habits
      .filter((habit) => habit.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const enriched: Habit[] = activeHabits.map((habit) => {
      const monthRecords = records.filter((record) =>
        record.habitId === habit.id && record.date.startsWith(`${year}-${String(month).padStart(2, '0')}-`),
      );
      const recordMap = new Map(monthRecords.map((record) => [record.date, record.completed]));
      const habitRecords = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return recordMap.get(date) ?? false;
      });
      const relevant = habitRecords.slice(0, currentDay);
      const completed = relevant.filter(Boolean).length;
      const streak = calcStreak(relevant);

      return {
        ...habit,
        records: habitRecords,
        stats: {
          completed,
          missed: currentDay - completed,
          percentage: currentDay > 0 ? Math.round((completed / currentDay) * 100) : 0,
          currentStreak: streak.current,
          longestStreak: streak.longest,
        },
      };
    });

    const totalCells = enriched.length * currentDay;
    const totalDone = enriched.reduce((sum, habit) => sum + habit.stats.completed, 0);
    const overallStreak = calcOverallStreak(enriched.map((habit) => habit.records.slice(0, currentDay)));

    return {
      habits: enriched,
      overall: {
        percentage: totalCells > 0 ? Math.round((totalDone / totalCells) * 100) : 0,
        currentStreak: overallStreak.current,
        longestStreak: overallStreak.longest,
      },
      meta: { year, month, daysInMonth, currentDay, isCurrentMonth },
    };
  },

  async exportBackup(): Promise<BackupData> {
    const [habits, habitRecords, dailyReflections] = await Promise.all([
      getAll<LocalHabit>('habits'),
      getAll<LocalHabitRecord>('habitRecords'),
      getAll<LocalDailyReflection>('dailyReflections'),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits,
      habitRecords,
      dailyReflections,
    };
  },

  async importBackup(data: BackupData) {
    if (data.version !== 1 || !Array.isArray(data.habits) || !Array.isArray(data.habitRecords) || !Array.isArray(data.dailyReflections)) {
      throw new Error('Invalid backup file.');
    }

    const db = await openDb();
    const tx = db.transaction(['habits', 'habitRecords', 'dailyReflections'], 'readwrite');
    const habitsStore = tx.objectStore('habits');
    const recordsStore = tx.objectStore('habitRecords');
    const reflectionsStore = tx.objectStore('dailyReflections');

    habitsStore.clear();
    recordsStore.clear();
    reflectionsStore.clear();

    data.habits.forEach((habit) => habitsStore.put(habit));
    data.habitRecords.forEach((record) => recordsStore.put(record));
    data.dailyReflections.forEach((reflection) => reflectionsStore.put(reflection));

    await waitForTransaction(tx);
  },
};
