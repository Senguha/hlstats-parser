import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Trash2, Clock } from "lucide-react"
import type { PlayerInfo } from "@/types/types"
import { formatMinutesToTime } from "@/lib/time-utils"

interface PlayerCardProps {
  player: PlayerInfo
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function PlayerCard({ player, isSelected, onSelect, onDelete }: PlayerCardProps) {
  const totalMinutes = Math.round(player.totalConnectionTimeSeconds / 60)
  const hasNoSessions = player.sessions.length === 0

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {player.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent>
        {hasNoSessions ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">No sessions found</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatMinutesToTime(totalMinutes)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatMinutesToTime(totalMinutes)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {player.sessions.length} session{player.sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
