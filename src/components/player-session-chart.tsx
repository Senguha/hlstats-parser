import type { GameSession } from "@/types/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { fillMissingDates, formatSecondsToTime } from "@/lib/time-utils";
import { useChartOptions } from "@/store/chartStore";

interface PlayerSessionsProps {
  sessions: GameSession[];
}

export function PlayerSessionChart(sessionsProps: PlayerSessionsProps) {
  const chartConfig = {
    total: {
      label: "Total Playtime",
      color: "var(--primary)",
    },
  };

  const { option } = useChartOptions();
  const chartData = fillMissingDates(sessionsProps.sessions, option);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="font-semibold">{payload[0].payload.date}</div>
          {payload.map((entry: any) => (
            <div
              key={entry.dataKey}
              className="flex items-center gap-2 text-sm"
            >
              <span className="text-muted-foreground">Played time</span>
              <span className="font-medium">
                {formatSecondsToTime(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (sessionsProps.sessions.length === 0) return null;
  return (
    <>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={35}/>
            <Bar
              dataKey="timeInSeconds"
              radius={[4, 4, 0, 0]}
              fill="var(--primary)"
            />
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </>
  );
}
