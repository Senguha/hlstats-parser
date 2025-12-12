export type GameSession = {
  date: Date
  time: string
  timeInSeconds: number
}

export type GameSessionShort = {
  date: string
  timeInSeconds: number
}

export type PlayerInfo = {
  id: string // HLStats ID
  name: string
  sessions: GameSession[]
  totalConnectionTimeSeconds: number
  createdAt: Date
}

export type Player = {
  id: string, // HLStats ID
  name?: string
}

export type Preset = {
  name: string
  players: Player[]
}

export type StaticPreset = Preset & {
  id: number,
  version: number
}

export type ChartOption = {
  type: "7days" | "30days" | "Full",
} | {
  type: "Range",
  startRange: Date,
  endRange: Date;
}
