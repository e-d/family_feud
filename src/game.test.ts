import { describe, expect, it } from 'vitest'
import { bank, newGame, reduce } from './game'
import { sampleGame } from './sample'

const start = () => reduce(newGame(sampleGame(), ['A', 'B']), { type: 'goToRound', round: 0 })

describe('game reducer', () => {
  it('banks revealed points with the multiplier and awards them', () => {
    let s = start()
    s = reduce(s, { type: 'reveal', index: 0 }) // Towel 38
    s = reduce(s, { type: 'reveal', index: 1 }) // Sunscreen 24
    s = reduce(s, { type: 'setMultiplier', multiplier: 2 })
    expect(bank(s)).toBe(124)
    s = reduce(s, { type: 'award', team: 1 })
    expect(s.teams[1].score).toBe(124)
    expect(bank(s)).toBe(0)
    s = reduce(s, { type: 'undoAward' })
    expect(s.teams[1].score).toBe(0)
    expect(bank(s)).toBe(124)
  })

  it('caps strikes at 3 but keeps counting buzzes', () => {
    let s = start()
    for (let i = 0; i < 4; i++) s = reduce(s, { type: 'strike' })
    expect(s.strikes).toBe(3)
    expect(s.strikeNonce).toBe(4)
  })

  it('resets the round state when changing rounds and clamps the index', () => {
    let s = reduce(start(), { type: 'reveal', index: 0 })
    s = reduce(s, { type: 'strike' })
    s = reduce(s, { type: 'goToRound', round: 99 })
    expect(s.round).toBe(s.game.questions.length - 1)
    expect(s.strikes).toBe(0)
    expect(s.revealed.every((r) => !r)).toBe(true)
  })

  it('starts with the chosen theme and can switch mid-game', () => {
    const s = newGame(sampleGame(), ['A', 'B'], 'halloween')
    expect(s.theme).toBe('halloween')
    expect(reduce(s, { type: 'setTheme', theme: 'christmas' }).theme).toBe('christmas')
  })
})
