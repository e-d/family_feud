import type { ThemeId } from './themes'
import type { Game, LiveState, Multiplier } from './types'

export const MAX_ANSWERS = 8
export const MAX_STRIKES = 3

export type Action =
  | { type: 'reveal'; index: number }
  | { type: 'revealAll' }
  | { type: 'strike' }
  | { type: 'clearStrikes' }
  | { type: 'award'; team: 0 | 1 }
  | { type: 'undoAward' }
  | { type: 'goToRound'; round: number }
  | { type: 'setMultiplier'; multiplier: Multiplier }
  | { type: 'setTheme'; theme: ThemeId }
  | { type: 'toggleQuestion' }
  | { type: 'setPhase'; phase: LiveState['phase'] }
  | { type: 'adjustScore'; team: 0 | 1; delta: number }
  | { type: 'renameTeam'; team: 0 | 1; name: string }

export function newGame(game: Game, teamNames: [string, string], theme: ThemeId = 'classic'): LiveState {
  return {
    game,
    phase: 'title',
    round: 0,
    revealed: roundReveals(game, 0),
    strikes: 0,
    strikeNonce: 0,
    showQuestion: false,
    multiplier: 1,
    theme,
    teams: [
      { name: teamNames[0], score: 0 },
      { name: teamNames[1], score: 0 },
    ],
    award: null,
  }
}

function roundReveals(game: Game, round: number): boolean[] {
  return game.questions[round].answers.map(() => false)
}

export function currentQuestion(state: LiveState) {
  return state.game.questions[state.round]
}

/** Points sitting in the bank: revealed answers × multiplier, until awarded. */
export function bank(state: LiveState): number {
  if (state.award) return 0
  const answers = currentQuestion(state).answers
  const sum = answers.reduce((total, a, i) => total + (state.revealed[i] ? a.points : 0), 0)
  return sum * state.multiplier
}

export function reduce(state: LiveState, action: Action): LiveState {
  switch (action.type) {
    case 'reveal': {
      const revealed = [...state.revealed]
      revealed[action.index] = !revealed[action.index]
      return { ...state, phase: 'round', revealed }
    }
    case 'revealAll':
      return { ...state, phase: 'round', revealed: state.revealed.map(() => true) }
    case 'strike':
      return {
        ...state,
        phase: 'round',
        strikes: Math.min(MAX_STRIKES, state.strikes + 1),
        strikeNonce: state.strikeNonce + 1,
      }
    case 'clearStrikes':
      return { ...state, strikes: 0 }
    case 'award': {
      const points = bank(state)
      if (points === 0) return state
      const teams = withScore(state.teams, action.team, points)
      return { ...state, teams, award: { team: action.team, points } }
    }
    case 'undoAward': {
      if (!state.award) return state
      const teams = withScore(state.teams, state.award.team, -state.award.points)
      return { ...state, teams, award: null }
    }
    case 'goToRound': {
      const round = Math.max(0, Math.min(state.game.questions.length - 1, action.round))
      return {
        ...state,
        phase: 'round',
        round,
        revealed: roundReveals(state.game, round),
        strikes: 0,
        showQuestion: false,
        award: null,
      }
    }
    case 'setMultiplier':
      return { ...state, multiplier: action.multiplier }
    case 'setTheme':
      return { ...state, theme: action.theme }
    case 'toggleQuestion':
      return { ...state, showQuestion: !state.showQuestion }
    case 'setPhase':
      return { ...state, phase: action.phase }
    case 'adjustScore':
      return { ...state, teams: withScore(state.teams, action.team, action.delta) }
    case 'renameTeam': {
      const teams: LiveState['teams'] = [...state.teams]
      teams[action.team] = { ...teams[action.team], name: action.name }
      return { ...state, teams }
    }
  }
}

function withScore(teams: LiveState['teams'], team: 0 | 1, delta: number): LiveState['teams'] {
  const next: LiveState['teams'] = [...teams]
  next[team] = { ...next[team], score: Math.max(0, next[team].score + delta) }
  return next
}
