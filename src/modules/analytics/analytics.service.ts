import AnalyticsRepository from './analytics.repository';

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
}
