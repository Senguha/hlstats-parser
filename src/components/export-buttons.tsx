import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { GameSession } from "@/types/types"
import { exportToCSV, exportToJSON } from "@/lib/export-utils"

interface ExportButtonsProps {
  sessions: GameSession[]
  playerName: string
}

export function ExportButtons({ sessions, playerName }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={() => exportToCSV(sessions, playerName)} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button onClick={() => exportToJSON(sessions, playerName)} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export JSON
      </Button>
    </div>
  )
}
