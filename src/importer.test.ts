import { describe, expect, it } from 'vitest'
import { parseCsv, parseQuestions } from './importer'

describe('parseQuestions', () => {
  it('reads plain text blocks with mixed separators', () => {
    const r = parseQuestions('Name a fruit\nApple, 40\nBanana | 30\n3. Cherry 10\n\nName a color\nRed: 50')
    expect(r.errors).toEqual([])
    expect(r.questions).toEqual([
      { prompt: 'Name a fruit', answers: [{ text: 'Apple', points: 40 }, { text: 'Banana', points: 30 }, { text: 'Cherry', points: 10 }] },
      { prompt: 'Name a color', answers: [{ text: 'Red', points: 50 }] },
    ])
  })

  it('warns about answer lines without points', () => {
    const r = parseQuestions('Name a fruit\nApple, 40\nKiwi')
    expect(r.questions[0].answers).toHaveLength(1)
    expect(r.warnings[0]).toMatch(/Kiwi/)
  })

  it('reads CSV with blank question cells continuing the question above', () => {
    const csv = 'question,answer,points\n"Name a fruit, any fruit",Apple,40\n,Banana,30\nName a color,Red,50\n'
    const r = parseQuestions(csv, 'game.csv')
    expect(r.errors).toEqual([])
    expect(r.questions.map((q) => q.prompt)).toEqual(['Name a fruit, any fruit', 'Name a color'])
    expect(r.questions[0].answers).toHaveLength(2)
  })

  it('rejects CSV without the required header', () => {
    const r = parseQuestions('a,b,c\n1,2,3', 'x.csv')
    expect(r.errors[0]).toMatch(/header/)
  })

  it('reads JSON in either shape and picks up the title', () => {
    const r = parseQuestions(JSON.stringify({ title: 'Party', questions: [{ question: 'Q', answers: [{ text: 'A', points: 5 }, 'B: 9'] }] }))
    expect(r.title).toBe('Party')
    expect(r.questions[0].answers).toEqual([{ text: 'B', points: 9 }, { text: 'A', points: 5 }])
  })

  it('sorts by points and keeps the top 8', () => {
    const lines = Array.from({ length: 10 }, (_, i) => `A${i}, ${i}`).join('\n')
    const r = parseQuestions(`Q\n${lines}`)
    expect(r.questions[0].answers).toHaveLength(8)
    expect(r.questions[0].answers[0]).toEqual({ text: 'A9', points: 9 })
    expect(r.warnings[0]).toMatch(/holds 8/)
  })

  it('reports invalid points and broken JSON', () => {
    expect(parseQuestions('[{"question":"Q","answers":[{"text":"A","points":-1}]}]').errors[0]).toMatch(/whole number/)
    expect(parseQuestions('{"questions": [').errors[0]).toMatch(/could not be read/)
    expect(parseQuestions('   ').errors[0]).toMatch(/Nothing to import/)
  })
})

describe('parseCsv', () => {
  it('handles quotes, escaped quotes and CRLF', () => {
    expect(parseCsv('a,"b ""c""",d\r\n1,"2\n3",4')).toEqual([
      ['a', 'b "c"', 'd'],
      ['1', '2\n3', '4'],
    ])
  })
})
