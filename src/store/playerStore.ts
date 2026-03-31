import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player, PlayerInfo } from "@/types/types"; // Make sure this path is correct
import { fetchPlayer } from "@/lib/fetches"; // Make sure this path is correct

type PlayerState = {
  // === STATE ===
  playersInfo: PlayerInfo[];
  selectedPlayerId: string | null;
  loading: boolean;
  error: string;
  loadingMessage: string;

  // === ACTIONS ===
  setSelectedPlayerId: (playerId: string | null) => void;
  deletePlayer: (playerId: string) => void;
  refreshAllPlayers: (playersToRefresh?: Player[]) => Promise<void>;
  loadPreset: (newPlayers: Player[]) => Promise<void>;
  loadPlayer: (player: Player) => Promise<void>;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE ---
      playersInfo: [],
      selectedPlayerId: null,
      loading: false,
      error: "",
      loadingMessage: "",

      // --- ACTIONS ---

      /**
       * Sets the currently selected player.
       */
      setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),

      /**
       * Deletes a player from the list.
       */
      deletePlayer: (playerId) => {
        set((state) => ({
          playersInfo: state.playersInfo.filter((p) => p.id !== playerId),
          // If the deleted player was selected, unselect
          selectedPlayerId:
            state.selectedPlayerId === playerId ? null : state.selectedPlayerId,
        }));
      },

      /**
       * Refreshes data for a list of players, or all players if none provided.
       */
      refreshAllPlayers: async (playersToRefresh?: Player[]) => {
        const targetPlayers = playersToRefresh || get().playersInfo;
        if (targetPlayers.length === 0) return;

        set({
          loading: true,
          error: "",
          loadingMessage: `Refreshing data for ${targetPlayers.length} player${
            targetPlayers.length !== 1 ? "s" : ""
          }...`,
        });

        try {
          const refreshedPlayersMap = new Map<string, PlayerInfo>();
          let completed = 0;

          // Create promises with progress tracking
          const playerPromises = targetPlayers.map(async (player) => {
            try {
              const playerInfo = await fetchPlayer(player.id);
              completed++;
              set({
                loadingMessage: `Refreshed ${completed}/${targetPlayers.length} players...`,
              });
              if (player.name) playerInfo.name = player.name
              return { success: true, data: playerInfo };
            } catch (error) {
              completed++;
              return { success: false, error, playerId: player.id };
            }
          });

          // Wait for all to complete
          const results = await Promise.allSettled(playerPromises);

          // Process results
          const errors: string[] = [];
          results.forEach((result) => {
            if (
              result.status === "fulfilled" &&
              result.value.success &&
              result.value.data
            ) {
              refreshedPlayersMap.set(result.value.data.id, result.value.data);
            } else if (result.status === "fulfilled" && !result.value.success) {
              errors.push(`Failed to refresh player ${result.value.playerId}`);
            }
          });

          // Update the playersInfo state by merging new data
          set((state) => ({
            playersInfo: state.playersInfo.map(
              (p) => refreshedPlayersMap.get(p.id) || p
            ),
          }));

          // Show errors if any
          if (errors.length > 0) {
            set({
              error: `Some players failed to refresh: ${errors.join(", ")}`,
            });
          }
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Failed to refresh player data",
          });
        } finally {
          set({ loading: false, loadingMessage: "" });
        }
      },

      /**
       * Loads a preset list of players in parallel with progress updates.
       */
      loadPreset: async (newPlayers: Player[]) => {
        set({
          loading: true,
          error: "",
          loadingMessage: `Loading preset with ${newPlayers.length} player${
            newPlayers.length !== 1 ? "s" : ""
          }...`,
        });

        try {
          const existingPlayers = get().playersInfo;

          // Separate existing and new players
          const playersToFetch: Player[] = [];
          const reusedPlayers: PlayerInfo[] = [];

          newPlayers.forEach((newPlayer) => {
            const existingPlayer = existingPlayers.find(
              (p) => p.id === newPlayer.id
            );

            if (existingPlayer) {
              reusedPlayers.push(existingPlayer);
            } else {
              playersToFetch.push(newPlayer);
            }
          });

          let fetchedPlayers: PlayerInfo[] = [];

          if (playersToFetch.length > 0) {
            let completed = 0;

            const playerPromises = playersToFetch.map(async (player) => {
              const playerInfo = await fetchPlayer(player.id);
              completed++;
              set({
                loadingMessage: `Loaded ${completed}/${playersToFetch.length} new players...`,
              });
              if (player.name) playerInfo.name = player.name
              return playerInfo;
            });

            fetchedPlayers = await Promise.all(playerPromises);
          }

          // Combine reused and fetched players in the original order
          const playersBuf: PlayerInfo[] = newPlayers.map((newPlayer) => {
            const reused = reusedPlayers.find((p) => p.id === newPlayer.id);
            if (reused) return reused;

            const fetched = fetchedPlayers.find((p) => p.id === newPlayer.id);
            return fetched!;
          });

          // Overwrite the list with the new preset list
          set({ playersInfo: playersBuf });

          // Select the first player
          if (playersBuf.length > 0) {
            set({ selectedPlayerId: playersBuf[0].id });
          } else {
            set({ selectedPlayerId: null });
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to load preset",
          });
        } finally {
          set({ loading: false, loadingMessage: "" });
        }
      },
      loadPlayer: async (player: Player) => {

        const existingPlayer = get().playersInfo.find(
          (p) => p.id === player.id
        );
        if (existingPlayer) {
          set({ selectedPlayerId: player.id,
            playersInfo: [existingPlayer],
            error: ""
           });
          return;
        }
        
        set({
          loading: true,
          error: "",
          loadingMessage: `Loading player...`,
        });

        try {
          const playerInfo = await fetchPlayer(player.id);
          if (player.name) playerInfo.name = player.name
          set({ playersInfo: [playerInfo], selectedPlayerId: player.id });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to load player",
          });
        } finally {
          set({ loading: false, loadingMessage: "" });
        } 
      },
    }),
    {
      name: "hlstats-players", // Key for localStorage
      // This function specifies which parts of the state to save.
      // We only want to save 'playersInfo'.
      partialize: (state) => ({ playersInfo: state.playersInfo }),
    }
  )
);
