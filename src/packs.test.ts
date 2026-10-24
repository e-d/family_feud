import { describe, expect, it } from 'vitest'
import { MAX_ANSWERS } from './game'
import { parseQuestions } from './importer'
import { PACKS } from './packs'
import { isThemeId } from './themes'

describe('ready-made packs', () => {
  it('have unique ids and titles', () => {
    expect(new Set(PACKS.map((p) => p.id)).size).toBe(PACKS.length)
    expect(new Set(PACKS.map((p) => p.title)).size).toBe(PACKS.length)
  })

  it('never repeat a question across packs', () => {
    const prompts = PACKS.flatMap((p) => p.questions.map((q) => q.prompt.toLowerCase()))
    expect(new Set(prompts).size).toBe(prompts.length)
  })

  for (const pack of PACKS) {
    describe(pack.title, () => {
      it('has a valid theme and at least 5 rounds', () => {
        if (pack.theme) expect(isThemeId(pack.theme)).toBe(true)
        expect(pack.questions.length).toBeGreaterThanOrEqual(5)
      })

      it.each(pack.questions.map((q) => [q.prompt, q] as const))('%s', (_, q) => {
        const points = q.answers.map((a) => a.points)
        expect(q.answers.length).toBeGreaterThanOrEqual(4)
        expect(q.answers.length).toBeLessThanOrEqual(MAX_ANSWERS)
        // Ranked highest first, like a real survey board.
        expect(points).toEqual([...points].sort((a, b) => b - a))
        expect(points.every((p) => Number.isInteger(p) && p > 0)).toBe(true)
        const total = points.reduce((a, b) => a + b, 0)
        expect(total).toBeGreaterThanOrEqual(80)
        expect(total).toBeLessThanOrEqual(100)
        const texts = q.answers.map((a) => a.text.toLowerCase())
        expect(new Set(texts).size).toBe(texts.length)
      })

      it('survives an export and re-import unchanged', () => {
        const result = parseQuestions(JSON.stringify(pack.questions.map((q) => ({ question: q.prompt, answers: q.answers }))))
        expect(result.errors).toEqual([])
        expect(result.warnings).toEqual([])
        expect(result.questions).toEqual(pack.questions)
      })
    })
  }
})
