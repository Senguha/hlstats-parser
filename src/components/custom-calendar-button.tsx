import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";


export function CalendarButton({ 
  range, 
  onSelect 
}: { 
  range: DateRange | undefined; 
  onSelect: (range: DateRange | undefined) => void;
}) {
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const handleFirstHalf = () => {
    const month = displayedMonth.getMonth();
    const year = displayedMonth.getFullYear();
    const firstDay = new Date(year, month, 1);
    const fourteenthDay = new Date(year, month, 14);
    onSelect({ from: firstDay, to: fourteenthDay });
  };

  const handleSecondHalf = () => {
    const month = displayedMonth.getMonth();
    const year = displayedMonth.getFullYear();
    const fifteenthDay = new Date(year, month, 15);
    const lastDay = new Date(year, month + 1, 0);
    onSelect({ from: fifteenthDay, to: lastDay });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto p-0">
        <Calendar
          mode="range"
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          selected={range}
          onSelect={onSelect}
          numberOfMonths={1}
        />
                <div className="p-3 border-t flex gap-2">
          <Button
            onClick={handleFirstHalf}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            1-2 week
          </Button>
          <Button
            onClick={handleSecondHalf}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            3-4 week
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}