import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Users,
  Loader2,
  EllipsisVertical,
  ArchiveRestore,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePresetStore } from "@/store/presetStore";
import { usePlayerStore } from "@/store/playerStore";
import { toast } from "sonner";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./ui/item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Preset } from "@/types/types";
import { ButtonGroup } from "./ui/button-group";

interface Player {
  id: string;
  name?: string;
}

export function PresetsDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPresetName, setEditingPresetName] = useState("");
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetPlayers, setNewPresetPlayers] = useState<Player[]>([]);
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [playerNameInput, setPlayerNameInput] = useState("");

  const { presets, addPreset, deletePreset, updatePreset } = usePresetStore();
  const { playersInfo, loadPreset, loading, loadingMessage } = usePlayerStore();

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Invalid name", {
        description: "Please enter a preset name",
      });
      return;
    }

    if (newPresetPlayers.length === 0) {
      toast.error("No players", {
        description: "Please add at least one player",
      });
      return;
    }

    try {
      if (isEditing) {
        updatePreset(editingPresetName, {
          name: newPresetName.trim(),
          players: newPresetPlayers,
        });
        toast.success("Preset updated", {
          description: `"${newPresetName}" has been updated`,
        });
      } else {
        addPreset({
          name: newPresetName.trim(),
          players: newPresetPlayers,
        });
        toast.success("Preset created", {
          description: `"${newPresetName}" has been saved`,
        });
      }

      setNewPresetName("");
      setNewPresetPlayers([]);
      setPlayerIdInput("");
      setPlayerNameInput("");
      setIsCreating(false);
      setIsEditing(false);
      setEditingPresetName("");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to save preset",
      });
    }
  };
    const handleRestorePreset = (presetData:Preset) => {
    if (!presetData.name.trim()) {
      toast.error("Invalid name", {
        description: "Restore preset doesn't have a name",
      });
      return;
    }

    if (presetData.players.length === 0) {
      toast.error("No players", {
        description: "Restore preset has to player data",
      });
      return;
    }

    try {
        addPreset(presetData);
        toast.success("Preset restored", {
          description: `"${presetData.name}" has been restored`,
        });   
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to restore preset",
      });
    }
  };
  const handleDuplicatePreset = (preset: Preset) => {
    try {
      addPreset({
        name: preset.name + " copy",
        players: preset.players,
      });
      toast.success("Preset created", {
        description: `"${newPresetName}" has been saved`,
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to save preset",
      });
    }
  };

  const handleAddPlayer = () => {
    if (!playerIdInput.trim()) return;

    if (newPresetPlayers.some((p) => p.id === playerIdInput.trim())) {
      toast.error("Duplicate player", {
        description: "This player is already in the list",
      });
      return;
    }

    const existingPlayer = playersInfo.find(
      (p) => p.id === playerIdInput.trim()
    );

    const newPlayer: Player = {
      id: playerIdInput.trim(),
      name: playerNameInput.trim() || existingPlayer?.name,
    };

    setNewPresetPlayers([...newPresetPlayers, newPlayer]);
    setPlayerIdInput("");
    setPlayerNameInput("");
  };

  const handleRemovePlayer = (playerId: string) => {
    setNewPresetPlayers(newPresetPlayers.filter((p) => p.id !== playerId));
  };

  const handleSelectPreset = async (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    try {
      loadPreset(preset.players).then(() => {
        const updateMap = new Map(
          playersInfo.map((item) => [item.id, item.name])
        );
        preset.players.forEach((player) => {
          const newName = updateMap.get(player.id);
          if (newName !== undefined) player.name = newName;
        });
        updatePreset(preset.name, preset);
      });
      setOpen(false);

      toast.success("Preset loaded", {
        description: `Loaded ${preset.players.length} player${preset.players.length !== 1 ? "s" : ""}`,
      });
    } catch (error) {
      toast.error("Error loading preset", {
        description:
          error instanceof Error ? error.message : "Failed to load preset",
      });
    }
  };

  const handleDeletePreset = (presetName: string) => {
    deletePreset(presetName);

    toast.success("Preset deleted", {
      description: `"${presetName}" has been removed`,
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setIsEditing(false);
    setNewPresetName("");
    setNewPresetPlayers([]);
    setPlayerIdInput("");
    setPlayerNameInput("");
  };

  const startEditing = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    setIsCreating(true);
    setIsEditing(true);
    setEditingPresetName(presetName);
    setNewPresetName(preset.name);
    setNewPresetPlayers(preset.players);
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingPresetName("");
    setNewPresetName("");
    setNewPresetPlayers([]);
    setPlayerIdInput("");
    setPlayerNameInput("");
  };

  const restorePreset = async (presetName: string) => {
    const res = await fetch('static/presets.json');
    const presetData = await res.json() as Preset[];

    console.log(presetData)

    const restorePreset = presetData.find((p)=> p.name===presetName);
    if (restorePreset !== undefined)
      handleRestorePreset(restorePreset);  
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Presets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Player Presets</DialogTitle>
          <DialogDescription>
            Select a preset to load multiple players or create a new one
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {!isCreating && (
              <>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {presets.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No presets yet</p>
                        <p className="text-sm">
                          Create your first preset to get started
                        </p>
                      </div>
                    )}
                    {presets.length > 0 &&
                      presets.map((preset) => (
                        <Item
                          key={preset.name}
                          className={cn(
                            "cursor-pointer transition-all hover:border-primary",
                            "hover:shadow-md"
                          )}
                          onClick={() => handleSelectPreset(preset.name)}
                          variant="outline"
                        >
                          <ItemContent>
                            <ItemTitle className="font-semibold">
                              {preset.name}
                            </ItemTitle>
                            <ItemDescription className="text-xs">
                              Players: {preset.players.length}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePreset(preset.name);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(preset.name);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicatePreset(preset);
                                  }}
                                >
                                  Duplicate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </ItemActions>
                        </Item>
                      ))}
                  </div>
                </ScrollArea>

                <ButtonGroup className="mx-auto">
                  <Button onClick={startCreating} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Preset
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore Preset
                  </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e)=> {e.stopPropagation(); restorePreset("top goon")}}>
                        Public
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e)=> {e.stopPropagation(); restorePreset("Jail Admins")}}>
                        Jail
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Freak
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        All admins
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroup>
              </>
            )}

            {isCreating && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., Weekend Squad"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player-id">Add Players</Label>
                  <div className="space-y-2">
                    <Input
                      id="player-id"
                      placeholder="Enter player ID"
                      value={playerIdInput}
                      onChange={(e) => setPlayerIdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddPlayer();
                        }
                      }}
                    />
                    <Input
                      id="player-name"
                      placeholder="Player name (optional)"
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPlayer();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddPlayer}
                      variant="secondary"
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Player
                    </Button>
                  </div>
                </div>

                {newPresetPlayers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Players ({newPresetPlayers.length})</Label>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <div className="space-y-2">
                        {newPresetPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 rounded-md bg-muted"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {player.name || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ID: {player.id}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemovePlayer(player.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCreatePreset}
                    disabled={
                      !newPresetName.trim() || newPresetPlayers.length === 0
                    }
                    className="flex-1"
                  >
                    {isEditing ? "Update Preset" : "Create Preset"}
                  </Button>
                  <Button
                    onClick={cancelCreating}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
