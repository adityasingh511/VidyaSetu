import { prisma } from '@/lib/prisma';

export default class AnalyticsRepository {
  static async getCompletedSessionsWithTopics(
    userId: string,
    from?: Date,
    to?: Date
  ) {
    return await prisma.quizSession.findMany({
      where: {
        userId,
        completedAt: {
          not: null,
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      },
      include: {
        responses: {
          include: {
            question: {
              include: {
                topic: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }
}
