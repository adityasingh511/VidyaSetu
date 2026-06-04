import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import AnalyticsService from './analytics.service';
import { WeakTopicAnalyticsError } from './analytics.types';
import { weakTopicsQuerySchema } from './analytics.validator';
import { SetCookies } from '@/lib/auth/cookies';

const handleAnalyticsError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: 'Invalid query parameters', errors: error.issues },
      { status: 400 }
    );
  }
  if (error instanceof WeakTopicAnalyticsError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }
  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
};

class AnalyticsController {
  static async getAnalytics(req: Request) {
    try {
      const access_token = await SetCookies.verifyCookies();

      if (!access_token)
        throw new Error('userId not accesseble at the controller');
      const res = await AnalyticsService.analytics(access_token.sub);

      return NextResponse.json(res, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ status: 401, message: error.message });
    }
  }

  static async getWeakTopics(req: Request) {
    try {
      const access_token = await SetCookies.verifyCookies();
      if (!access_token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(req.url);
      const rawParams = Object.fromEntries(url.searchParams.entries());
      const params = weakTopicsQuerySchema.parse(rawParams);

      const result = await AnalyticsService.getWeakTopics(
        access_token.sub,
        params
      );

      return NextResponse.json(
        { message: 'Weak topics retrieved successfully', data: result },
        { status: 200 }
      );
    } catch (error: unknown) {
      return handleAnalyticsError(error);
    }
  }
}

export default AnalyticsController;
export { AnalyticsController };
