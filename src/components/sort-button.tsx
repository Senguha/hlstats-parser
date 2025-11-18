import { Button } from "./ui/button";
import type { SortType } from "./player-comparison-charts";
import { ArrowDown01, ArrowDown10, ArrowDownUp } from "lucide-react";

type SortButtonProps = {
  sortType: SortType;
  onSelect: (sortType: SortType) => void;
};

export function SortButton({ sortType, onSelect }: SortButtonProps) {
  const handleClick = () => {
    if (sortType === "none") {
      onSelect("asc");
    } else if (sortType === "asc") {
      onSelect("desc");
    } else {
      onSelect("none");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
    >
      {sortType === "none" && <ArrowDownUp className="h-4 w-4" />}
      {sortType === "asc" && <ArrowDown01 className="h-4 w-4" />}
      {sortType === "desc" && <ArrowDown10 className="h-4 w-4" />}
    </Button>
  );
}
