import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import type { ChartData } from "./player-comparison-charts";
import { DialogTitle } from "@radix-ui/react-dialog";
import { formatMinutesToTime } from "@/lib/time-utils";

type SelectableDataGridProps = {
  rawData: ChartData[];
  children: React.ReactNode;
};

const PlayerDataFields = {
  Name: "Name",
  TotalPlaytime: "TotalPlaytime",
  Last7Days: "Last7Days",
  Last30Days: "Last30Days",
  CustomRange: "CustomRange",
};

type PlayerData = {
  Name: string;
  TotalPlaytime: string;
  Last7Days: string;
  Last30Days: string;
  CustomRange: string;
};

type SelectedCell = {
  rowIndex: number;
  colKey: keyof PlayerData;
  value: string;
};

export default function PlayerTable({
  rawData,
  children,
}: SelectableDataGridProps) {
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [copiedCells, setCopiedCells] = useState<SelectedCell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    rowIndex: number;
    colKey: keyof PlayerData;
  } | null>(null);

  const columnHeaders = Object.keys(PlayerDataFields) as (keyof PlayerData)[];

  const data: PlayerData[] = rawData.map((item: ChartData) => {
    return {
      Name: item.name,
      TotalPlaytime: formatMinutesToTime(item.total),
      Last7Days: formatMinutesToTime(item.last7Days),
      Last30Days: formatMinutesToTime(item.last30Days),
      CustomRange: formatMinutesToTime(item.customRange),
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C or Cmd+C
      if (
        e.ctrlKey &&
        (e.key === "c" || e.key === "с") &&
        selectedCells.length > 0
      ) {
        e.preventDefault();
        copyToClipboard();
      }
      // Escape to clear selection
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells]);

  const handleCellMouseDown = (
    rowIndex: number,
    colKey: keyof PlayerData,
    value: string
  ) => {
    setIsSelecting(true);
    setSelectionStart({ rowIndex, colKey });
    setSelectedCells([{ rowIndex, colKey, value }]);
  };

  const handleCellMouseEnter = (rowIndex: number, colKey: keyof PlayerData) => {
    if (!isSelecting || !selectionStart) return;

    // Only select cells in the same column
    if (selectionStart.colKey !== colKey) return;

    const startRow = Math.min(selectionStart.rowIndex, rowIndex);
    const endRow = Math.max(selectionStart.rowIndex, rowIndex);

    const newSelection: SelectedCell[] = [];
    for (let i = startRow; i <= endRow; i++) {
      newSelection.push({
        rowIndex: i,
        colKey,
        value: data[i][colKey],
      });
    }

    setSelectedCells(newSelection);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const copyToClipboard = async () => {
    if (selectedCells.length === 0) return;

    try {
      const textToCopy = selectedCells
        .map((cell) => String(cell.value))
        .join("\n");
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCells([...selectedCells]);
      setTimeout(() => setCopiedCells([]), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearSelection = () => {
    setSelectedCells([]);
    setSelectionStart(null);
  };

  const isCellSelected = (rowIndex: number, colKey: keyof PlayerData) => {
    return selectedCells.some(
      (cell) => cell.rowIndex === rowIndex && cell.colKey === colKey
    );
  };

  const isCellCopied = (rowIndex: number, colKey: keyof PlayerData) => {
    return copiedCells.some(
      (cell) => cell.rowIndex === rowIndex && cell.colKey === colKey
    );
  };

  return (
    <>
      {data.length === 0 && (children)}
      {data.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent onMouseUp={handleMouseUp} className="min-w-3xl">
            <DialogTitle className="hidden">Selectable Data Grid</DialogTitle>
            <div className="text-sm text-muted-foreground">
              <p>
                <kbd>Ctrl+C:</kbd> Copy selected cells
              </p>
              <p>
                <kbd>Esc:</kbd> Clear selection
              </p>
            </div>

            <Table className="select-none">
              <TableHeader>
                <TableRow>
                  {columnHeaders.map((header, idx) => (
                    <TableHead key={idx}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columnHeaders.map((colKey) => (
                      <TableCell
                        key={`${rowIndex}-${colKey}`}
                        onMouseDown={() =>
                          handleCellMouseDown(rowIndex, colKey, row[colKey])
                        }
                        onMouseEnter={() =>
                          handleCellMouseEnter(rowIndex, colKey)
                        }
                        className={`cursor-pointer transition-colors relative ${
                          isCellSelected(rowIndex, colKey)
                            ? "bg-accent ring-1 ring-inset rounded"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="relative z-10">{row[colKey]}</span>
                        {isCellCopied(rowIndex, colKey) && (
                          <span className="absolute inset-0 bg-primary/50 animate-pulse" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
