import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Player } from "@/types/types";
import { PresetsDialog } from "./presetChooser";
import { ModeToggle } from "./theme-toggle";

interface PresetsHeaderProps {
  currentPlayers: Player[];
  onLoadPreset: (players: Player[]) => void;
  onRefresh: () => void;
  hasPlayers: boolean;
  isRefreshing: boolean;
}


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
          <ModeToggle/>
        </div>
      </div>
    </header>
  );
}
