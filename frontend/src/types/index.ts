export interface Habit {
  id: number;
  name: string;
  category: string | null;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  records: boolean[];
  stats: HabitStats;
}

export interface HabitStats {
  completed: number;
  missed: number;
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

export interface OverallStats {
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

export interface MonthMeta {
  year: number;
  month: number;
  daysInMonth: number;
  currentDay: number;
  isCurrentMonth: boolean;
}

export interface MonthData {
  habits: Habit[];
  overall: OverallStats;
  meta: MonthMeta;
}

export interface Reflection {
  id?: number;
  date: string;
  mood: 'happy' | 'neutral' | 'sad' | null;
  energy: number | null;
  remarks: string | null;
  tomorrowFocus: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
