import { PlayerCard } from "./player-card";
import type { PlayerInfo } from "@/types/types";

interface PlayerListProps {
  players: PlayerInfo[];
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string) => void;
  loading?: boolean;
}

export function PlayerList({
  players,
  selectedPlayerId,
  onSelectPlayer,
  loading,
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground mt-54">
        <p>No players to display</p>
        <p>
          Please select a <b>preset</b>
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {players.map((player) => (

            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onSelect={() => onSelectPlayer(player.id)}
            />

      ))}
    </div>
  );
}
