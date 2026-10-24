import type { ThemeId } from './themes'

export interface Answer {
  text: string
  points: number
}

export interface Question {
  prompt: string
  answers: Answer[]
}

export interface Game {
  id: string
  title: string
  questions: Question[]
  createdAt: number
}

export interface Team {
  name: string
  score: number
}

export type Phase = 'title' | 'round' | 'final'
export type Multiplier = 1 | 2 | 3

/** Everything the board needs to render. The host owns it; the board only reads it. */
export interface LiveState {
  game: Game
  phase: Phase
  round: number
  revealed: boolean[]
  strikes: number
  /** Increments on every strike so the board can replay the buzzer even at 3 strikes. */
  strikeNonce: number
  showQuestion: boolean
  multiplier: Multiplier
  theme: ThemeId
  /** Soft music on the TV's title screen. */
  music: boolean
  teams: [Team, Team]
  award: { team: 0 | 1; points: number } | null
}
