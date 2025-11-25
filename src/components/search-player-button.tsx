import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { cn, parseSearchQuery } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";
import { toast } from "sonner";
import { fetchHLStatsID } from "@/lib/fetches";

export default function SearchPlayerButton() {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isError, setIsError] = useState(false);

  const { loadPlayer } = usePlayerStore();

  const handleSearch = async () => {
    const query = inputRef.current?.value
    const result = parseSearchQuery(query);

    if (result.type === "Invalid"){
        toast.error("Invalid input", {
            description: "Please enter a valid SteamID or HLStats ID",
        });
        setIsError(true);
        setTimeout(() => setIsError(false), 2000);
        return;
    }

    if (result.type === "HLStatsID"){
        loadPlayer({id: result.value});
    }
    if (result.type === "SteamID"){
        const res = await fetchHLStatsID(result.value);
        if (res.status === "error"){
            toast.error(res.error);
            setIsError(true);
            setTimeout(() => setIsError(false), 2000);
            return;
        }
        const hlstatsid = res.playerID;

        toast.success(`Found HLStats ID${hlstatsid}`);
        loadPlayer({id: hlstatsid});
    }
      
    

  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [active]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setActive(!active);
        }}
      >
        {active ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </Button>
      {active && (
        <Input
          type="text"
          placeholder="SteamID/HLStatsID"
          className={cn("max-w-[20ch] transition-colors", `${isError ? "focus-visible:ring-destructive focus-visible:border-destructive bg-destructive/10" : ""}`)}

          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setActive(false);
          }}
        />
        
      )}
    </>
  );
}
