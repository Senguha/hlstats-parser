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
import { CalendarIcon } from "lucide-react"
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useChartOptions } from "@/store/chartStore";
import { cn } from "@/lib/utils";

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
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getTime() - 14*86400000),
    to: new Date(),
  });

  useEffect(() => {
    if (range?.from && range?.to)
    setChartOption({type: "Range",
        startRange: range?.from,
        endRange: range?.to
      })
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
    .filter((s) => {if (!range?.from && !range?.to) 
      return s; 
      else {
      const date = new Date(s.date)
      return date >= range.from! && date <= range.to!}
      }).reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0);

  const rangeLabel = `${range?.from?.toLocaleDateString("en-GB")}-${range?.to?.toLocaleDateString("en-GB")}`;

  const stats = [
    {
      label: "Last 7 Days",
      value: formatMinutesToTime(last7DaysMinutes),
      sessions: sessions.filter((s) => isWithinDays(s.date, 7)).length,
      chartOption: {type: "7days"},
    },
    {
      label: "Last 30 Days",
      value: formatMinutesToTime(last30DaysMinutes),
      sessions: sessions.filter((s) => isWithinDays(s.date, 30)).length,
      chartOption: {type: "30days"},
    },
    {
      label: rangeLabel,
      value: formatMinutesToTime(rangeMinutes),
      sessions: sessions.filter((s) => {
        if (!range?.from && !range?.to) 
      return s; 
      else {
        const date = new Date(s.date);
        return date >= range.from! && date <= range.to!;
      }}).length,
      chartOption: {type: "Range",
        startRange: range?.from,
        endRange: range?.to
      },
    },
  ] as PlaytimeStat[];


console.log(stats);
  const {setChartOption, option} = useChartOptions();

  return (
    <div className="flex gap-8 flex-wrap">
      {stats.map((stat, index) => {
        if (index !== 2)
          return (
            <Item key={stat.label} variant="muted" className={cn("flex-1 min-w-72 hover:cursor-pointer hover:bg-accent transition-all", option.type === stat.chartOption.type && "bg-accent border-2 border-primary")} onClick={()=>{setChartOption(stat.chartOption)}}>
              <ItemContent>
                <ItemTitle className="text-sm font-medium">
                  {stat.label}
                </ItemTitle>
                <ItemDescription>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.sessions} session{stat.sessions !== 1 ? "s" : ""}
                </ItemDescription>
              </ItemContent>
            </Item>
          );
        else
          return (
            <Item key={stat.label} variant="muted" className={cn("flex-1 min-w-72 hover:cursor-pointer hover:bg-accent transition-all", option.type === stat.chartOption.type && "bg-accent border-2 border-primary")} onClick={()=>{setChartOption(stat.chartOption)}}>
              <ItemContent>
                <ItemTitle className="text-sm font-medium">
                  {stat.label}
                </ItemTitle>
                <ItemDescription>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.sessions} session{stat.sessions !== 1 ? "s" : ""}
                </ItemDescription> 
              </ItemContent>
              <ItemActions>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <CalendarIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                  >
                <Calendar
                className="w-full"
                mode="range"
                defaultMonth={range?.from}
                onSelect={setRange}
                showOutsideDays
                selected={range}
              />
                  </PopoverContent>
                </Popover>
              </ItemActions>
            </Item>
          );
      })}
    </div>
  );
}
