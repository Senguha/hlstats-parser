import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useState } from "react";

type CalendarWithQuickSelectProps = {
  range: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
};

export function CalendarWithQuickSelect({
  range,
  onSelect,
}: CalendarWithQuickSelectProps) {
  // Track which month is being displayed in the calendar
  const [displayedMonth, setDisplayedMonth] = useState<Date>(
    range?.from || new Date()
  );

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
    const lastDay = new Date(year, month + 1, 0); // Last day of month

    onSelect({ from: fifteenthDay, to: lastDay });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon-sm" variant="outline" className="rounded-full">
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="end">
        <Calendar
          className="w-full"
          mode="range"
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          onSelect={onSelect}
          showOutsideDays
          selected={range}
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
      </PopoverContent>
    </Popover>
  );
}
