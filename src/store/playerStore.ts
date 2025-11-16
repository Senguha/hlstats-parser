import { create }  from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, PlayerInfo } from '@/types/types'; // Make sure this path is correct
import { fetchPlayer } from '@/lib/fetches'; // Make sure this path is correct

type PlayerState ={
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
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE ---
      playersInfo: [],
      selectedPlayerId: null,
      loading: false,
      error: '',
      loadingMessage: '',

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
        // Use provided players or default to all players in the store
        const targetPlayers = playersToRefresh || get().playersInfo;
        if (targetPlayers.length === 0) return;

        set({
          loading: true,
          error: '',
          loadingMessage: `Refreshing data for ${targetPlayers.length} player${
            targetPlayers.length !== 1 ? 's' : ''
          }...`,
        });

        try {
          const refreshedPlayersMap = new Map<string, PlayerInfo>();

          // Fetch new data for all target players
          for (let i = 0; i < targetPlayers.length; i++) {
            const player = targetPlayers[i];
            set({
              loadingMessage: `Refreshing ${player.name}... (${i + 1}/${
                targetPlayers.length
              })`,
            });

            const playerInfo = await fetchPlayer(player.id);
            refreshedPlayersMap.set(playerInfo.id, playerInfo);
          }

          // Update the playersInfo state by merging new data
          set((state) => ({
            playersInfo: state.playersInfo.map(
              (p) => refreshedPlayersMap.get(p.id) || p
            ),
          }));
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : 'Failed to refresh player data',
          });
        } finally {
          set({ loading: false, loadingMessage: '' });
        }
      },

      /**
       * Loads a preset list of players, fetching new players and reusing existing ones.
       */
      loadPreset: async (newPlayers: Player[]) => {
        set({
          loading: true,
          error: '',
          loadingMessage: `Loading preset with ${newPlayers.length} player${
            newPlayers.length !== 1 ? 's' : ''
          }...`,
        });

        try {
          const playersBuf: PlayerInfo[] = [];
          const existingPlayers = get().playersInfo; // Get current players from state

          // Iterate over the preset list
          for (let i = 0; i < newPlayers.length; i++) {
            const newPlayer = newPlayers[i];

            // Check if player already exists in our state
            const existingPlayer = existingPlayers.find(
              (p) => p.id === newPlayer.id
            );

            if (existingPlayer) {
              playersBuf.push(existingPlayer); // Reuse existing data
            } else {
              // Player is new, fetch their data
              set({
                loadingMessage: `Loading player ${newPlayer.name}... (${i + 1}/${
                  newPlayers.length
                })`,
              });

              const playerInfo = await fetchPlayer(newPlayer.id);
              playersBuf.push(playerInfo);
            }
          }

          // Overwrite the list with the new preset list
          set({ playersInfo: playersBuf });

          // Select the first player in the new list
          if (playersBuf.length > 0) {
            set({ selectedPlayerId: playersBuf[0].id });
          } else {
            set({ selectedPlayerId: null }); // No players, select null
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to load preset',
          });
        } finally {
          set({ loading: false, loadingMessage: '' });
        }
      },
    }),
    {
      name: 'hlstats-players', // Key for localStorage
      // This function specifies which parts of the state to save.
      // We only want to save 'playersInfo'.
      partialize: (state) => ({ playersInfo: state.playersInfo }),
    }
  )
);