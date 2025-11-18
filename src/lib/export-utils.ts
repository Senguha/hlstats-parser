import type { GameSession, Preset } from "@/types/types"
import { useCallback, useState } from "react"

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

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function usePresetImporter() {
  const [preset, setPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importPreset = useCallback((file: File): Promise<Preset> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      // Validate file type
      if (file.type !== 'application/json') {
        const err = new Error('Please select a JSON file');
        setError(err.message);
        setLoading(false);
        reject(err);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const presetData = JSON.parse(content) as Preset;

          // Basic validation
          if (!presetData.name || !Array.isArray(presetData.players)) {
            throw new Error('Invalid preset format: missing name or players array');
          }

          // Validate players structure
          for (const player of presetData.players) {
            if (!player.id || typeof player.id !== 'string') {
              throw new Error('Invalid player: missing or invalid id');
            }
          }

          setPreset(presetData);
          setLoading(false);
          resolve(presetData);
        } catch (err) {
          const errorMessage = `Failed to parse JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`;
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        }
      };

      reader.onerror = () => {
        const err = new Error('Failed to read file');
        setError(err.message);
        setLoading(false);
        reject(err);
      };

      reader.readAsText(file);
    });
  }, []);

  const reset = useCallback(() => {
    setPreset(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    preset,
    loading,
    error,
    importPreset,
    reset
  };
}
