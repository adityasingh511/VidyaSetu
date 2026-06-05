'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ActivityDay } from '@/modules/analytics/analytics.types';

interface StreakCalendarProps extends React.ComponentProps<'div'> {
  calendar: ActivityDay[];
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-emerald-200',
  2: 'bg-emerald-400',
  3: 'bg-emerald-600',
  4: 'bg-emerald-800',
};

const LEVEL_LABELS: Record<number, string> = {
  0: 'No activity',
  1: '1-2 sessions',
  2: '3-5 sessions',
  3: '6-10 sessions',
  4: '10+ sessions',
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function StreakCalendar({ calendar, className, ...props }: StreakCalendarProps) {
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  const monthLabels = React.useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();

      if (month !== lastMonth) {
        labels.push({
          label: new Date(firstDay.date).toLocaleString('default', {
            month: 'short',
          }),
          index: weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <div className="flex items-center gap-2 text-xs ml-10">
        {monthLabels.map((m) => (
          <span
            key={m.index}
            className="text-muted-foreground"
            style={{ marginLeft: m.index === 0 ? 0 : `${(m.index - monthLabels[0].index) * 14}px` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pt-0">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground h-[14px] leading-[14px]"
              style={{ visibility: label ? 'visible' : 'hidden' }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                if (!day) return <div key="empty" className="h-[14px] w-[14px]" />;

                return (
                  <div
                    key={day.date}
                    className={cn(
                      'h-[14px] w-[14px] rounded-sm cursor-default',
                      LEVEL_COLORS[day.level]
                    )}
                    title={`${day.date}: ${LEVEL_LABELS[day.level]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn('h-[10px] w-[10px] rounded-sm', LEVEL_COLORS[level])}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export { StreakCalendar };
