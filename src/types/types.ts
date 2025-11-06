export type GameSession = {
  date: Date
  time: string
  timeInSeconds: number
}

export type PlayerInfo = {
  id: string
  name: string
  sessions: GameSession[]
  totalConnectionTimeSeconds: number
}

export type Player = {
  id: string,
  name?: string
}

export type Preset = {
  name: string
  players: Player[]
  createdAt: Date
}
