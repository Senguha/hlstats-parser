import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlaytimeSummary } from "@/components/playtime-summary";
import { PlayerList } from "@/components/player-list";
import { PlayerComparisonCharts } from "@/components/player-comparison-charts";
import { PresetsHeader } from "@/components/header";
import { usePlayerStore } from "@/store/playerStore";
import { PlayerSessionChart } from "./components/player-session-chart";
import { RotateCcwIcon } from "lucide-react";
import { useChartOptions } from "./store/chartStore";
import { LoadingSkeleton } from "./components/loading-skeleton";

export default function App() {
  const {
    playersInfo,
    selectedPlayerId,
    loading,
    error,
    loadingMessage,
    setSelectedPlayerId,
    loadPreset,
    refreshAllPlayers,
  } = usePlayerStore();

  const selectedPlayer = playersInfo.find((p) => p.id === selectedPlayerId);

  useEffect(() => {
    // onFinishRehydration runs *after* the store has been hydrated
    const unsubscribe = usePlayerStore.persist.onFinishHydration((state) => {
      if (state.playersInfo.length > 0) {
        refreshAllPlayers(state.playersInfo);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshAllPlayers]);

  const { setChartOption } = useChartOptions();

  return (
    <div className="min-h-screen">
      {
        <PresetsHeader
          currentPlayers={playersInfo.map((p) => p)}
          onLoadPreset={loadPreset}
          onRefresh={() => refreshAllPlayers()}
          hasPlayers={playersInfo.length > 0}
          isRefreshing={loading}
        />
      }

      <div className="container mx-auto p-4 md:p-8 space-y-6">
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

        {loading ? (
          <LoadingSkeleton/>
        ) : (
          <>
            {playersInfo.length > 1 && (
              <PlayerComparisonCharts players={playersInfo} loading={loading} />
            )}

            <div>
              <h2 className="text-2xl font-semibold mb-4">Players</h2>
              <PlayerList
                players={playersInfo}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId} // Pass action from store
                loading={loading}
              />
            </div>

            {selectedPlayer && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <div>
                        {selectedPlayer.name}'s Game Sessions
                        <p className="text-sm text-muted-foreground font-normal">
                          Found {selectedPlayer.sessions.length} session
                          {selectedPlayer.sessions.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <RotateCcwIcon
                        className="h-8 w-8 shadow rounded-full p-2 transition-all hover:cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setChartOption({ type: "Full" });
                        }}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <PlaytimeSummary sessions={selectedPlayer.sessions} />
                    <PlayerSessionChart sessions={selectedPlayer.sessions} />
                    {/* <SessionsTable sessions={selectedPlayer.sessions} /> */}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
