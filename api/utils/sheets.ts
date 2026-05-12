import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

export type Direction = "public" | "jail" | "ff2";
export type Level = "1" | "2" | "3" | "jail curator" | "public curator" | "ff2 curator" | "manager";

export interface Player {
  id: string;
  name: string;
}

export interface Preset {
  name: string;
  id: number;
  version: number;
  players: Player[];
}

interface SheetRow {
  player: Player;
  direction: Direction;
  level: Level;
}

// Колонки которые нам нужны и их заголовки в таблице
const COLUMN_HEADERS = {
  LVL:       "LVL",
  NAME:      "Steam Nickname",
  HLSTATS:   "HLSTATS",
  DIRECTION: "Направление",
} as const;

type ColumnKey = keyof typeof COLUMN_HEADERS;

function resolveColumns(headerRow: string[]): Record<ColumnKey, number> {
  const result = {} as Record<ColumnKey, number>;

  for (const [key, header] of Object.entries(COLUMN_HEADERS) as [ColumnKey, string][]) {
    const idx = headerRow.findIndex(
      (cell) => cell.trim().toLowerCase() === header.trim().toLowerCase()
    );
    if (idx === -1) throw new Error(`Column "${header}" not found in sheet headers`);
    result[key] = idx;
  }

  return result;
}

const VALID_DIRECTIONS = new Set(["public", "jail", "ff2"]);
const VALID_LEVELS = new Set(["1", "2", "3", "jail curator", "public curator", "ff2 curator", "manager"]);
const ADMIN_LEVELS = new Set(["1", "2", "3"]);
const CURATOR_LEVELS = new Set(["jail curator", "public curator", "ff2 curator", "manager"]);

export async function getPresets(): Promise<Preset[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "АДМИНЫ!A1:Z", // берём всё, первая строка — заголовки
  });

  const [headerRow, ...dataRows] = response.data.values ?? [];
  if (!headerRow) throw new Error("Sheet is empty");

  const COL = resolveColumns(headerRow);
  const parsed: SheetRow[] = [];

  for (const row of dataRows) {
    const lvl       = row[COL.LVL]?.trim().toLowerCase();
    const name      = row[COL.NAME]?.trim();
    const hlstats   = row[COL.HLSTATS]?.trim();
    const direction = row[COL.DIRECTION]?.trim().toLowerCase();

    if (!lvl || !name || !hlstats || !direction) continue;
    if (!VALID_LEVELS.has(lvl)) continue;
    if (!VALID_DIRECTIONS.has(direction)&&lvl!=="manager") continue;

    parsed.push({
      player: { id: hlstats, name },
      direction: direction as Direction,
      level: lvl as Level,
    });
  }

  const byDirection = (dir: Direction): Player[] =>
    parsed
      .filter((r) => r.direction === dir && ADMIN_LEVELS.has(r.level))
      .map((r) => r.player);

  const presets: Preset[] = [
    {
      name: "All Admins",
      id: 0,
      version: 1,
      players: parsed
        .filter((r) => ADMIN_LEVELS.has(r.level))
        .map((r) => r.player),
    },
    {
      name: "Public Admins",
      id: 1,
      version: 1,
      players: byDirection("public"),
    },
    {
      name: "Jail Admins",
      id: 2,
      version: 1,
      players: byDirection("jail"),
    },
    {
      name: "FF2 Admins",
      id: 3,
      version: 1,
      players: byDirection("ff2"),
    },
    {
      name: "Curators",
      id: 4,
      version: 1,
      players: parsed
        .filter((r) => CURATOR_LEVELS.has(r.level))
        .map((r) => r.player),
    },
  ];

  return presets.filter((p) => p.players.length > 0);
}