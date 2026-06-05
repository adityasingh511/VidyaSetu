export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActivityDate: string | null;
  todayActive: boolean;
  calendar: ActivityDay[];
}

export interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}
