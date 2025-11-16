import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Check } from "lucide-react"
import type { PlayerInfo } from "@/types/types"
import { parseTimeToMinutes, isWithinDays, formatMinutesToTime } from "@/lib/time-utils"

interface PlayerComparisonChartsProps {
  players: PlayerInfo[]
  loading?: boolean
}

type ChartType = "total" | "last7Days" | "last30Days"

export function PlayerComparisonCharts({ players, loading }: PlayerComparisonChartsProps) {
  const [chartType, setChartType] = useState<ChartType>("total")
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(players.map((p) => p.id))

  if (players.length === 0) return null

  const filteredPlayers = players.filter((player) => selectedPlayerIds.includes(player.id))

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== playerId)
      } else {
        return [...prev, playerId]
      }
    })
  }

  const toggleAll = () => {
    if (selectedPlayerIds.length === players.length) {
      setSelectedPlayerIds([players[0].id])
    } else {
      setSelectedPlayerIds(players.map((p) => p.id))
    }
  }

  const chartData = filteredPlayers.map((player) => {
    const last7DaysMinutes = player.sessions
      .filter((session) => isWithinDays(session.date, 7))
      .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0)

    const last30DaysMinutes = player.sessions
      .filter((session) => isWithinDays(session.date, 30))
      .reduce((sum, session) => sum + parseTimeToMinutes(session.time), 0)

    const totalMinutes = Math.round(player.totalConnectionTimeSeconds / 60)

    return {
      name: player.name.length > 15 ? player.name.substring(0, 15) + "..." : player.name,
      fullName: player.name,
      total: totalMinutes,
      last7Days: last7DaysMinutes,
      last30Days: last30DaysMinutes,
    }
  })

  const chartConfig = {
    total: {
      label: "Total Playtime",
      color: "var(--primary)",
    },
    last7Days: {
      label: "Last 7 Days",
      color: "var(--primary)",
    },
    last30Days: {
      label: "Last 30 Days",
      color: "var(--primary)",
    },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="font-semibold">{payload[0].payload.fullName}</div>
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatMinutesToTime(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const chartInfo = {
    total: {
      title: "Total Playtime Comparison",
      description: "All-time connection time for each player",
      dataKey: "total",
      color: "var(--color-total)",
    },
    last7Days: {
      title: "Last 7 Days Comparison",
      description: "Playtime in the last week",
      dataKey: "last7Days",
      color: "var(--color-last7Days)",
    },
    last30Days: {
      title: "Last 30 Days Comparison",
      description: "Playtime in the last month",
      dataKey: "last30Days",
      color: "var(--color-last30Days)",
    },
  }

  const currentChart = chartInfo[chartType]

  return (
    <div className={`space-y-6 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <CardTitle>{currentChart.title}</CardTitle>
              <CardDescription>{currentChart.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start bg-transparent">
                    <Check className="mr-2 h-4 w-4" />
                    {selectedPlayerIds.length === players.length
                      ? "All Players"
                      : `${selectedPlayerIds.length} Selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="end">
                  <div className="p-2">
                    <div className="flex items-center gap-2 border-b pb-2 mb-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedPlayerIds.length === players.length}
                        onCheckedChange={toggleAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                        Select All
                      </label>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`player-${player.id}`}
                            checked={selectedPlayerIds.includes(player.id)}
                            onCheckedChange={() => togglePlayer(player.id)}
                          />
                          <label htmlFor={`player-${player.id}`} className="text-sm cursor-pointer flex-1 truncate">
                            {player.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Playtime</SelectItem>
                  <SelectItem value="last7Days">Last 7 Days</SelectItem>
                  <SelectItem value="last30Days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={currentChart.dataKey} fill={currentChart.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
