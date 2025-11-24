import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { parseSearchQuery } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";
import { fetchHLStatsID } from "@/lib/fetches";
import { toast } from "sonner";

export default function SearchPlayerButton() {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { loadPlayer } = usePlayerStore();

  const handleSearch = async () => {
    const query = inputRef.current?.value
    const result = parseSearchQuery(query);

    if (result.type === "HLStatsID"){
        loadPlayer({id: result.value});
    }
    if (result.type === "SteamID"){
        const hlstatsid = await fetchHLStatsID(result.value);
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
          className="max-w-[20ch]"
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
