//import { useQuery, useQueries } from '@tanstack/react-query'
import * as cheerio from 'cheerio'
import type { GameSession, PlayerInfo } from '../types/types' // Adjust path as needed
import { parseTimeToSeconds } from './time-utils'



export async function fetchPlayer(playerId: string): Promise<PlayerInfo> {
  if (!playerId) {
    throw new Error("Player ID is required")
  }
// Fetch the player info page
  const urlInfo = `https://stats.chillout.pw/hlstats.php?mode=playerinfo&player=${playerId}`
  const responseInfo = await fetch(urlInfo, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!responseInfo.ok) {
    throw new Error("Failed to fetch player info")
  }

  const htmlInfo = await responseInfo.text();

  if (htmlInfo.includes("No player ID specified") || htmlInfo.includes("ERROR")) {
    throw new Error("Invalid player ID or player not found")
  }

  // Parse HTML with cheerio
  const $ = cheerio.load(htmlInfo)

  let playerName = ""

  // Find all bold tags on the page
  const allBoldTags: string[] = []
  $("b").each((_, elem) => {
    const text = $(elem).text().trim()
    if (text) {
      allBoldTags.push(text)
    }
  })

  // Filter to find the player name
  // Player name characteristics:
  // - Not empty
  // - Not a number (like "11,882")
  // - Not a label (doesn't contain ":")
  // - Not "Player Profile"
  // - Typically short (less than 50 characters)
  // - Usually appears early in the page
  for (const text of allBoldTags) {
    // Skip if it's a known label or pattern
    if (
      text === "Player Profile" ||
      text.includes(":") ||
      text.includes("Total") ||
      text.includes("Statistics") ||
      /^\d+$/.test(text) || // Pure number
      /^[\d,]+$/.test(text) || // Number with commas
      text.length > 50
    ) {
      continue
    }

    // If it looks like a name (contains letters), use it
    if (/[a-zA-Z]/.test(text)) {
      playerName = text
      break
    }
  }

  // Extract total connection time
  let totalConnectionTime = ""
  let totalConnectionTimeSeconds = 0

  // Find the row containing "Total Connection Time:"
  $("table.data-table tr").each((_, row) => {
    const cells = $(row).find("td")
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim()
      if (label === "Total Connection Time:") {
        totalConnectionTime = $(cells[1]).text().trim()
        // Parse the time format "2d 16:13:09h"
        totalConnectionTimeSeconds = parseTimeToSeconds(totalConnectionTime.replace(/h$/, ""))
      }
    }
  })

  if (!playerName) {
    playerName = `Player ${playerId}`
  }

  // return {
  //   playerName,
  //   totalConnectionTime,
  //   totalConnectionTimeSeconds,
  // }

  // Fetch the player sessions page
  const urlSessions = `https://stats.chillout.pw/hlstats.php?mode=playersessions&player=${playerId}`
  const responseSessions = await fetch(urlSessions, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!responseSessions.ok) {
    throw new Error("Failed to fetch player sessions")
  }

  const htmlSessions = await responseSessions.text()

  // Check for error messages
  if (htmlSessions.includes("No player ID specified") || htmlSessions.includes("ERROR")) {
    throw new Error("Invalid player ID or player not found")
  }

  // Parse HTML with cheerio
  const $S = cheerio.load(htmlSessions)
  const sessions: GameSession[] = []


  $S("table.data-table tbody tr").each((_, row) => {
    const cells = $S(row).find("td")

    if (cells.length >= 4) {
      const sDate = $S(cells[0]).text().trim()
      const time = $S(cells[3]).text().trim()

      // Only add if we have valid data and skip first row which is a header
      if (sDate && time && sDate !== "Date") {
        const date = new Date(sDate);
        sessions.push({
          date,
          time,
          timeInSeconds: parseTimeToSeconds(time),
        })
      }
    }
  })

  const Player = {
    id: playerId,
    name: playerName,
    sessions,
    totalConnectionTimeSeconds: totalConnectionTimeSeconds,
  } as PlayerInfo;

  return Player;
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