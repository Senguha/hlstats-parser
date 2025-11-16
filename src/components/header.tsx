import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookmarkPlus, Bookmark, Trash2, RefreshCw } from "lucide-react";
import type { Player, Preset } from "@/types/types";
import { PresetsDialog } from "./presetChooser";

interface PresetsHeaderProps {
  currentPlayers: Player[];
  onLoadPreset: (players: Player[]) => void;
  onRefresh: () => void;
  hasPlayers: boolean;
  isRefreshing: boolean;
}

const TEST_PRESETS: Preset[] = [
  {
    name: "Top Players",
    players: [
      { id: "52" },
      { id: "1234" },
      { id: "5678" },
      { id: "9012" },
      { id: "11234" },
      { id: "14567" },
    ],
  },
  {
    name: "123",
    players: [{ id: "123" }],
  },
];

export function PresetsHeader({
  onRefresh,
  hasPlayers,
  isRefreshing,
}: PresetsHeaderProps) {
  return (
    <header className="sticky top-0 z-50 md:w-[85vw] w-full mx-auto border-b border-border/40 bg-background shadow-md rounded-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <h1 className="text-2xl text-muted-foreground font-bold tracking-tight transition-all hover:scale-105 hover:text-primary">HLStats Parser</h1>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={!hasPlayers || isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <PresetsDialog />
        </div>
      </div>
    </header>
  );
}
