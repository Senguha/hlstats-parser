import type { ChartOption, GameSession } from "@/types/types";
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  isWithinDays,
} from "@/lib/time-utils";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./ui/item";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useChartOptions } from "@/store/chartStore";
import { cn } from "@/lib/utils";
import { CalendarWithQuickSelect } from "./custom-calendar";

interface PlaytimeSummaryProps {
  sessions: GameSession[];
}

export interface PlaytimeStat {
  label: string;
  value: string;
  sessions: number;
  chartOption: ChartOption;
}

export function PlaytimeSummary({ sessions }: PlaytimeSummaryProps) {
  const today = new Date();
  const twoWeeksAgo = new Date(new Date().getTime() - 14 * 86400000);
  const [range, setRange] = useState<DateRange | undefined>({
    from: twoWeeksAgo,
    to: today,
  });

  const { setChartOption, option } = useChartOptions();

  useEffect(() => {
    if (range?.from && range?.to && option.type === "Range")
      setChartOption({
        type: "Range",
        startRange: range?.from,
        endRange: range?.to,
      });
  }, [range]);

  // Calculate last 7 days playtime
  const last7DaysMinutes = sessions
    .filter((session) => isWithinDays(session.date, 7))
    .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0);

  // Calculate last 30 days playtime
  const last30DaysMinutes = sessions
    .filter((session) => isWithinDays(session.date, 30))
    .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0);

  const rangeMinutes = sessions
    .filter((s) => {
      if (!range?.from && !range?.to) return s;
      else {
        const date = new Date(s.date);
        return date >= range.from! && date <= range.to!;
      }
    })
    .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0);

  const rangeLabel = `${range?.from?.toLocaleDateString("en-GB")}-${range?.to?.toLocaleDateString("en-GB")}`;

  const stats = [
    {
      label: "Last 7 Days",
      value: formatMinutesToTime(last7DaysMinutes),
      sessions: sessions.filter((s) => isWithinDays(s.date, 7)).length,
      chartOption: { type: "7days" },
    },
    {
      label: "Last 30 Days",
      value: formatMinutesToTime(last30DaysMinutes),
      sessions: sessions.filter((s) => isWithinDays(s.date, 30)).length,
      chartOption: { type: "30days" },
    },
    {
      label: rangeLabel,
      value: formatMinutesToTime(rangeMinutes),
      sessions: sessions.filter((s) => {
        if (!range?.from && !range?.to) return s;
        else {
          const date = new Date(s.date);
          return date >= range.from! && date <= range.to!;
        }
      }).length,
      chartOption: {
        type: "Range",
        startRange: range?.from,
        endRange: range?.to,
      },
    },
  ] as PlaytimeStat[];


  return (
    <div className="flex gap-8 flex-wrap">
      {stats.map((stat, index) => {
        if (index !== 2)
          return (
            <Item
              key={stat.label}
              variant="muted"
              className={cn(
                "flex-1 min-w-72 hover:cursor-pointer hover:bg-accent transition-all",
                option.type === stat.chartOption.type &&
                  "bg-accent ring-1 ring-muted-foreground/70"
              )}
              onClick={() => {
                setChartOption(stat.chartOption);
              }}
            >
              <ItemContent>
                <ItemTitle className="text-sm font-medium">
                  {stat.label}
                </ItemTitle>
                <ItemDescription>
                  <span className="text-2xl font-bold">{stat.value}</span><br/>
                  {stat.sessions} session{stat.sessions !== 1 ? "s" : ""}
                </ItemDescription>
              </ItemContent>
            </Item>
          );
        else
          return (
            <Item
              key={stat.label}
              variant="muted"
              className={cn(
                "flex-1 min-w-72 hover:cursor-pointer hover:bg-accent transition-all",
                option.type === stat.chartOption.type &&
                  "bg-accent ring-1 ring-muted-foreground/70"
              )}
              onClick={() => {
                setChartOption(stat.chartOption);
              }}
            >
              <ItemContent>
                <ItemTitle className="text-sm font-medium">
                  {stat.label}
                </ItemTitle>
                <ItemDescription>
                  <span className="text-2xl font-bold">{stat.value}</span><br/>
                  {stat.sessions} session{stat.sessions !== 1 ? "s" : ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <CalendarWithQuickSelect range={range} onSelect={setRange} />
              </ItemActions>
            </Item>
          );
      })}
    </div>
  );
}
