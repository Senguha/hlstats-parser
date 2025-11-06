import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkPlus, Bookmark, Trash2, RefreshCw } from "lucide-react"
import type { Player, Preset } from "@/types/types"

interface PresetsHeaderProps {
  currentPlayers: Player[]
  onLoadPreset: (players: Player[]) => void
  onRefresh: () => void
  hasPlayers: boolean
  isRefreshing: boolean
}

const TEST_PRESETS: Preset[] = [
  {
    name: "Top Players",
    players: [{id:"52"}, {id:"1234"}, {id:"5678"}, {id:"9012"}, {id:"11234"}, {id:"14567"}],
    createdAt: new Date("2024-01-15"),
  },
  {
    name: "123",
    players: [{id:"123"}],
    createdAt: new Date()
  }
]

export function PresetsHeader({
  currentPlayers,
  onLoadPreset,
  onRefresh,
  hasPlayers,
  isRefreshing,
}: PresetsHeaderProps) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [presetName, setPresetName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const savedPresets = localStorage.getItem("hlstats-presets")
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets)
        setPresets(parsed)
      } catch (err) {
        console.error("Failed to load presets:", err)
      }
    }
  }, [])

  useEffect(()=>{
    setPresets(TEST_PRESETS);
  },[])

  useEffect(() => {
    if (presets.length > 0) {
      localStorage.setItem("hlstats-presets", JSON.stringify(presets))
    } else {
      localStorage.removeItem("hlstats-presets")
    }
  }, [presets])

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    if (currentPlayers.length === 0) return

    const newPreset: Preset = {
      name: presetName.trim(),
      players: currentPlayers,
      createdAt: new Date(),
    }

    setPresets((prev) => [...prev, newPreset])
    setPresetName("")
    setDialogOpen(false)
  }

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.players);
  }

  const handleDeletePreset = (presetName: string) => {
    setPresets((prev) => prev.filter((p) => p.name !== presetName))
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background shadow-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">HLStats Parser</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <Button variant="outline" onClick={onRefresh} disabled={!hasPlayers || isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={currentPlayers.length === 0}>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save Preset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Player Preset</DialogTitle>
                <DialogDescription>
                  Save the current {currentPlayers.length} player{currentPlayers.length !== 1 ? "s" : ""} as a
                  preset for quick access later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., Top Players, Team A, etc."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSavePreset()
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Save Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={presets.length === 0}>
                <Bookmark className="mr-2 h-4 w-4" />
                Load Preset
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Presets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {presets.map((preset) => (
                <DropdownMenuItem key={preset.name} className="flex items-center justify-between group">
                  <button onClick={() => handleLoadPreset(preset)} className="flex-1 text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.players.length} player{preset.players.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePreset(preset.name)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
