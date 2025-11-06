import type { GameSession } from "@/types/types"

export function exportToCSV(sessions: GameSession[], playerName: string) {
  const csv = [
    ["Date", "Time Played", "Time (seconds)"].join(","),
    ...sessions.map((s) => [s.date, s.time, s.timeInSeconds].join(",")),
  ].join("\n")

  downloadFile(csv, `${playerName}_sessions.csv`, "text/csv")
}

export function exportToJSON(sessions: GameSession[], playerName: string) {
  const data = {
    playerName,
    exportDate: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions: sessions.map((s) => ({
      date: s.date,
      timeFormatted: s.time,
      timeInSeconds: s.timeInSeconds,
    })),
  }

  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${playerName}_sessions.json`, "application/json")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
