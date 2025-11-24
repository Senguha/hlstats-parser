//import { useQuery, useQueries } from '@tanstack/react-query'
import type SteamID from 'steamid';
import type { PlayerInfo } from '../types/types' // Adjust path as needed



export async function fetchPlayer(playerId: string): Promise<PlayerInfo> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/playerInfo/${playerId}`);

  const data = await res.json();  
  if (!res.ok){
    throw new Error(`Error getting player info. ${data?.error}`)
  }

  return data;
}

type fetchHLStatsIDResponse = {
  status: "success";
  playerID: string;
} | {
  status: "error";
  error?: string;
};

export async function fetchHLStatsID(steamID: SteamID): Promise<fetchHLStatsIDResponse>{
  
  try {
      const steamID2 = steamID.steam2();
  const res = await fetch(`${import.meta.env.VITE_API_URL}/hlstatsid?steamid=${steamID2}`);

  const data = await res.json();  
  if (!res.ok){
    throw new Error(`Error getting player info. ${data?.error}`)
  }

  return ({status: "success", playerID: data.playerID});
  } catch (error) {
    if (error instanceof Error) {
      return ({status: "error", error: error.message});
    }
    return ({status: "error"});
  }

}

// Custom hook for fetching a single player's sessions
// export function usePlayerSessions(playerId: string, options?: { enabled?: boolean }) {
//   return useQuery({
//     queryKey: ['playerSessions', playerId],
//     queryFn: () => fetchPlayerSessions(playerId),
//     enabled: options?.enabled ?? !!playerId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     retry: 2,
//   })
// }

// // Custom hook for fetching multiple players' sessions
// export function useMultiplePlayerSessions(playerIds: string[]) {
//   return useQueries({
//     queries: playerIds.map(playerId => ({
//       queryKey: ['playerSessions', playerId],
//       queryFn: () => fetchPlayerSessions(playerId),
//       enabled: !!playerId,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       retry: 2,
//     })),
//   })
// }

// Example usage in a component:

// Single player:
// function PlayerStats({ playerId }) {
//   const { data, isLoading, error } = usePlayerSessions(playerId)
//
//   if (isLoading) return <div>Loading...</div>
//   if (error) return <div>Error: {error.message}</div>
//
//   return (
//     <div>
//       <h2>{data.playerName}</h2>
//       <p>Total sessions: {data.sessions.length}</p>
//       {data.sessions.map((session, idx) => (
//         <div key={idx}>
//           <span>{session.date}</span> - <span>{session.time}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// Multiple players:
// function MultiPlayerStats({ playerIds }) {
//   const queries = useMultiplePlayerSessions(playerIds)
//
//   const isLoading = queries.some(q => q.isLoading)
//   const hasError = queries.some(q => q.error)
//
//   if (isLoading) return <div>Loading players...</div>
//   if (hasError) return <div>Some players failed to load</div>
//
//   return (
//     <div>
//       {queries.map((query, idx) => {
//         if (query.data) {
//           const totalTime = query.data.sessions.reduce(
//             (sum, session) => sum + session.timeInSeconds,
//             0
//           )
//           return (
//             <div key={playerIds[idx]}>
//               <h3>{query.data.playerName}</h3>
//               <p>Sessions: {query.data.sessions.length}</p>
//               <p>Total time: {Math.floor(totalTime / 3600)}h</p>
//             </div>
//           )
//         }
//         return null
//       })}
//     </div>
//   )
// }