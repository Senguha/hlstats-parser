import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarDays } from "lucide-react"
import type { GameSession } from "@/types/types"
import { parseTimeToMinutes, formatMinutesToTime, isWithinDays } from "@/lib/time-utils"

interface PlaytimeSummaryProps {
  sessions: GameSession[]
}

export function PlaytimeSummary({ sessions }: PlaytimeSummaryProps) {
  // Calculate last 7 days playtime
  const last7DaysMinutes = sessions
    .filter((session) => isWithinDays(session.date, 7))
    .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0)

  // Calculate last 30 days playtime
  const last30DaysMinutes = sessions
    .filter((session) => isWithinDays(session.date, 30))
    .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0)

  const stats = [
    {
      label: "Last 7 Days",
      value: formatMinutesToTime(last7DaysMinutes),
      icon: Calendar,
      sessions: sessions.filter((s) => isWithinDays(s.date, 7)).length,
    },
    {
      label: "Last 30 Days",
      value: formatMinutesToTime(last30DaysMinutes),
      icon: CalendarDays,
      sessions: sessions.filter((s) => isWithinDays(s.date, 30)).length,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.sessions} session{stat.sessions !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
