export interface StreakResult {
  current: number;
  longest: number;
}

export function calculateStreak(records: boolean[]): StreakResult {
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

  for (let i = records.length - 1; i >= 0 && records[i]; i--) {
    current++;
  }

  return { current, longest };
}

export function calculateOverallStreak(habits: boolean[][]): StreakResult {
  if (habits.length === 0 || habits[0].length === 0) return { current: 0, longest: 0 };
  
  const days = habits[0].length;
  let current = 0;
  let longest = 0;
  let run = 0;

  for (let d = 0; d < days; d++) {
    const allDone = habits.every((h) => h[d]);
    if (allDone) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  for (let d = days - 1; d >= 0; d--) {
    const allDone = habits.every((h) => h[d]);
    if (allDone) current++;
    else break;
  }

  return { current, longest };
}

export function getStatusColor(pct: number): string {
  if (pct >= 95) return '#10b981';
  if (pct >= 80) return '#3b82f6';
  if (pct >= 60) return '#f59e0b';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

export function getStatusLabel(pct: number): string {
  if (pct >= 95) return 'Excellent';
  if (pct >= 80) return 'Very good';
  if (pct >= 60) return 'Improving';
  if (pct >= 40) return 'Needs attention';
  return 'Poor';
}
