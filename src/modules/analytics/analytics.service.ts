import AnalyticsRepository from './analytics.repository';
import type { StreakData, ActivityDay } from './analytics.types';

export default class AnalyticsService {
  static async analytics(userId: string) {
    const { user, sessionCount, sessions } =
      await AnalyticsRepository.getOverview(userId);

    const totalAttempts = sessionCount;
    let totalAccuracy = 0;

    for (const session of sessions) {
      totalAccuracy += session.accuracy;
    }

    const accuracy =
      totalAttempts > 0
        ? Math.round((totalAccuracy / totalAttempts) * 10) / 10
        : 0;
    const currentStreak = user?.streakCount ?? 0;
    const lastActivity = user?.lastActiveDate?.toISOString() ?? null;

    return { totalAttempts, accuracy, currentStreak, lastActivity };
  }

  static async getStreakData(userId: string): Promise<StreakData> {
    const sessions = await AnalyticsRepository.getCompletedSessionDates(
      userId
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityByDate = new Map<string, number>();

    for (const s of sessions) {
      if (!s.completedAt) continue;
      const d = new Date(s.completedAt);
      d.setHours(0, 0, 0, 0);
      const key = dateToKey(d);
      activityByDate.set(key, (activityByDate.get(key) ?? 0) + 1);
    }

    const activeDates = [...activityByDate.keys()].sort().reverse();
    const todayKey = dateToKey(today);

    const todayActive = activeDates[0] === todayKey;

    let currentStreak = 0;
    const cursor = new Date(today);

    if (!todayActive) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (activityByDate.has(dateToKey(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    let longestStreak = 0;
    let tempStreak = 0;
    const sortedAsc = [...activityByDate.keys()].sort();

    for (let i = 0; i < sortedAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedAsc[i - 1]);
        const curr = new Date(sortedAsc[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / 86400000;

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    const calendar: ActivityDay[] = [];
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);

    for (let i = 0; i < 365; i++) {
      const d = new Date(oneYearAgo);
      d.setDate(d.getDate() + i);
      const key = dateToKey(d);
      const count = activityByDate.get(key) ?? 0;
      calendar.push({
        date: key,
        count,
        level: countToLevel(count),
      });
    }

    return {
      currentStreak,
      longestStreak,
      totalActiveDays: activeDates.length,
      lastActivityDate: activeDates[0] ?? null,
      todayActive,
      calendar,
    };
  }
}

function dateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}
