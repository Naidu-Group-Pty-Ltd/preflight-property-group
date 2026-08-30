import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarHeatmapProps {
  events: Array<{ startTime?: string }>;
  currentMonth: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function CalendarHeatmap({ events, currentMonth, selectedDate, onDateSelect }: CalendarHeatmapProps) {
  const safeParseISO = (value: string | undefined): Date | null => {
    try {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const eventCountByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      const d = safeParseISO(event.startTime);
      if (d) {
        const key = format(d, 'yyyy-MM-dd');
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  const maxEvents = useMemo(() => {
    const counts = Object.values(eventCountByDay);
    return counts.length > 0 ? Math.max(...counts) : 1;
  }, [eventCountByDay]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    const intensity = count / maxEvents;
    if (intensity <= 0.25) return 'bg-success/20 border-success/30';
    if (intensity <= 0.5) return 'bg-brand-500/30 border-brand-500/40';
    if (intensity <= 0.75) return 'bg-warning/40 border-warning/50';
    return 'bg-destructive/50 border-destructive/60';
  };

  const getHeatmapLabel = (count: number) => {
    if (count === 0) return 'Free';
    const intensity = count / maxEvents;
    if (intensity <= 0.25) return 'Light';
    if (intensity <= 0.5) return 'Moderate';
    if (intensity <= 0.75) return 'Busy';
    return 'Very Busy';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Busy Days Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted/30" />
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/20" />
            <span>Light</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-brand-500/30" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning/40" />
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive/50" />
            <span>Very Busy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}

        <TooltipProvider delayDuration={100}>
          {calendarDays.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const count = eventCountByDay[key] || 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDateSelect(day)}
                    className={cn(
                      'aspect-square rounded-md transition-all text-xs font-medium relative border',
                      'hover:scale-110 hover:z-10 hover:shadow-lg',
                      getHeatmapColor(count),
                      !isCurrentMonth && 'opacity-30',
                      isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      isToday(day) && 'font-bold'
                    )}
                  >
                    <span className={cn(
                      'absolute inset-0 flex items-center justify-center',
                      isToday(day) && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {count > 0 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold opacity-70">
                        {count}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-medium">{format(day, 'EEEE, MMM d')}</div>
                  <div className="text-muted-foreground">
                    {count} event{count !== 1 ? 's' : ''} • {getHeatmapLabel(count)}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
