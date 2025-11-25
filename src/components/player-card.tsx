import { User, Clock } from "lucide-react"
import type { PlayerInfo } from "@/types/types"
import { formatMinutesToTime } from "@/lib/time-utils"
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item"

interface PlayerCardProps {
  player: PlayerInfo
  isSelected: boolean
  onSelect: () => void
}

export function PlayerCard({ player, isSelected, onSelect }: PlayerCardProps) {
  const totalMinutes = Math.round(player.totalConnectionTimeSeconds / 60)

  return (
    <Item
      className={`py-2 cursor-pointer transition-all hover:bg-accent ${isSelected ? "bg-accent ring-1 ring-muted-foreground/70" : ""}`}
      onClick={onSelect}
      variant="outline"
    >
      <ItemContent>
        <ItemTitle className="flex w-full">

          <User className="h-4 w-4" />

          <span className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[12ch]">{player.name}</span>

 
          <div className="flex flex-col items-end text-sm text-muted-foreground ml-auto">
              <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatMinutesToTime(totalMinutes)}</span>

              </div>
              <span className="text-xs font-normal">Updated: {new Date(player.createdAt)?.toLocaleString("en-GB", {month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"})}</span>
          </div>
        </ItemTitle>
        <ItemDescription>
        </ItemDescription>
      </ItemContent>
      </Item>   
  )
}
