import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SessionsTable } from "@/components/sessions-table";
import { PlaytimeSummary } from "@/components/playtime-summary";
import { PlayerList } from "@/components/player-list";
import { ExportButtons } from "@/components/export-buttons";
import { PlayerComparisonCharts } from "@/components/player-comparison-charts";
import { PresetsHeader } from "@/components/presets-header";
import type { Player, PlayerInfo } from "@/types/types";
import { fetchPlayer } from "./lib/fetches";

export default function App() {
  const [playersInfo, setPlayersInfo] = useState<PlayerInfo[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const selectedPlayer = playersInfo.find((p) => p.id === selectedPlayerId);

  const refreshAllPlayers = async (playersToRefresh?: Player[]) => {
    const targetPlayers = playersToRefresh || playersInfo;
    if (targetPlayers.length === 0) return;

    setLoading(true);
    setError("");
    setLoadingMessage(
      `Refreshing data for ${targetPlayers.length} player${targetPlayers.length !== 1 ? "s" : ""}...`
    );

    try {
      const refreshedPlayers: PlayerInfo[] = [];

      for (let i = 0; i < targetPlayers.length; i++) {
        const player = targetPlayers[i];
        setLoadingMessage(
          `Refreshing ${player.name}... (${i + 1}/${targetPlayers.length})`
        );

        const PlayerInfo = await fetchPlayer(player.id);
        refreshedPlayers.push(PlayerInfo);
      }
      setPlayersInfo(refreshedPlayers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh player data"
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayersInfo((prev) => prev.filter((p) => p.id !== playerId));
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    }
  };

  const handleLoadPreset = async (newPlayers: Player[]) => {
    setLoading(true);
    setError("");
    setLoadingMessage(
      `Loading preset with ${newPlayers.length} player${newPlayers.length !== 1 ? "s" : ""}...`
    );

    try {
      const playersBuf: PlayerInfo[] = [];

      for (const newPlayer of newPlayers) {
        if (playersInfo.some((p) => p.id === newPlayer.id)) {
          const existingPlayer = playersInfo.find((p) => p.id === newPlayer.id);
          if (existingPlayer) {
            playersBuf.push(existingPlayer);
          }
          continue;
        }

        setLoadingMessage(
          `Loading player ${newPlayer.name}... (${newPlayers.length + 1}/${newPlayers.length})`
        );

        const PlayerInfo = await fetchPlayer(newPlayer.id);
        playersBuf.push(PlayerInfo);
      }

      setPlayersInfo(playersBuf);
      if (playersBuf.length > 0) {
        setSelectedPlayerId(newPlayers[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preset");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    const savedPlayers = localStorage.getItem("hlstats-players");
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        setPlayersInfo(parsed);
        // Refresh data for all players on page load
        refreshAllPlayers(parsed);
      } catch (err) {
        console.error("Failed to load saved players:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (playersInfo.length > 0) {
      localStorage.setItem("hlstats-players", JSON.stringify(playersInfo));
    } else {
      localStorage.removeItem("hlstats-players");
    }
  }, [playersInfo]);

  return (
    <div className="min-h-screen">
      {
        <PresetsHeader
          currentPlayers={playersInfo.map((p) => p)}
          onLoadPreset={handleLoadPreset}
          onRefresh={() => refreshAllPlayers()}
          hasPlayers={playersInfo.length > 0}
          isRefreshing={loading}
        />
      }

      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            Game Session Parser
          </h1>
          <p className="text-muted-foreground text-lg">
            Extract and analyze player game sessions from HLStats
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && loadingMessage && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div>
                <p className="font-medium">{loadingMessage}</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch the latest data...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {playersInfo.length > 1 && (
          <PlayerComparisonCharts players={playersInfo} loading={loading} />
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4">Players</h2>
          <PlayerList
            players={playersInfo}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onDeletePlayer={handleDeletePlayer}
            loading={loading}
          />
        </div>

        {selectedPlayer && (
          <>
            <PlaytimeSummary sessions={selectedPlayer.sessions} />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPlayer.name}'s Game Sessions</CardTitle>
                    <CardDescription>
                      Found {selectedPlayer.sessions.length} session
                      {selectedPlayer.sessions.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <ExportButtons
                    sessions={selectedPlayer.sessions}
                    playerName={selectedPlayer.name}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <SessionsTable sessions={selectedPlayer.sessions} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
