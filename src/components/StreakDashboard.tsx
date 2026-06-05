'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { StreakCounter } from '@/components/StreakCounter';
import { StreakCalendar } from '@/components/StreakCalendar';
import { StreakBadges } from '@/components/StreakBadges';
import type { StreakData } from '@/modules/analytics/analytics.types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StreakDashboardProps extends React.ComponentProps<'div'> {
  className?: string;
}

function StreakDashboard({ className, ...props }: StreakDashboardProps) {
  const [data, setData] = React.useState<StreakData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStreakData() {
      try {
        const res = await fetch('/api/analytics/streak', {
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        } else {
          setError('Failed to load streak data');
        }
      } catch {
        setError('Failed to load streak data');
      } finally {
        setLoading(false);
      }
    }

    fetchStreakData();
  }, []);

  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800',
          className
        )}
        {...props}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StreakCounter
          currentStreak={data?.currentStreak ?? 0}
          longestStreak={data?.longestStreak ?? 0}
          todayActive={data?.todayActive ?? false}
          loading={loading}
          className="lg:col-span-1"
        />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[140px] animate-pulse rounded bg-muted" />
            ) : (
              <StreakCalendar calendar={data?.calendar ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      <StreakBadges
        currentStreak={data?.currentStreak ?? 0}
        longestStreak={data?.longestStreak ?? 0}
        loading={loading}
      />
    </div>
  );
}

export { StreakDashboard };
