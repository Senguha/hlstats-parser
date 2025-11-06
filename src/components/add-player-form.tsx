import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"

interface AddPlayerFormProps {
  onAddPlayer: (playerId: string, customName?: string) => Promise<void>
  loading: boolean
}

export function AddPlayerForm({ onAddPlayer, loading }: AddPlayerFormProps) {
  const [playerId, setPlayerId] = useState("")
  const [customName, setCustomName] = useState("")

  const handleSubmit = async () => {
    if (!playerId.trim()) return

    await onAddPlayer(playerId.trim(), customName.trim() || undefined)
    setPlayerId("")
    setCustomName("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Player</CardTitle>
        <CardDescription>Enter a player ID to fetch their game session history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="playerId">Player ID *</Label>
            <Input
              id="playerId"
              type="text"
              placeholder="e.g., 52"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customName">Custom Name (optional)</Label>
            <Input
              id="customName"
              type="text"
              placeholder="e.g., My Friend"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
              disabled={loading}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !playerId.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
