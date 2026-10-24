import { MAX_ANSWERS } from './game'
import type { Answer, Question } from './types'

export interface ImportResult {
  title?: string
  questions: Question[]
  warnings: string[]
  errors: string[]
}

const MAX_QUESTIONS = 100
const MAX_PROMPT_LENGTH = 200
const MAX_ANSWER_LENGTH = 60
const MAX_POINTS = 999

/** Parse questions from a file or pasted text. Format is detected from the file name, then the content. */
export function parseQuestions(input: string, fileName = ''): ImportResult {
  const text = input.replace(/^﻿/, '').trim()
  const result: ImportResult = { questions: [], warnings: [], errors: [] }
  if (!text) {
    result.errors.push('Nothing to import. Add at least one question with its answers.')
    return result
  }

  const ext = fileName.toLowerCase().split('.').pop()
  let raw: RawQuestion[]
  try {
    if (ext === 'json' || /^[[{]/.test(text)) {
      raw = fromJson(text, result)
    } else if (ext === 'csv' || /^"?question"?\s*,/i.test(text)) {
      raw = fromCsv(text, result)
    } else {
      raw = fromText(text, result)
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err))
    return result
  }

  normalize(raw, result)
  if (result.questions.length === 0 && result.errors.length === 0) {
    result.errors.push('No questions found. Check the format examples below.')
  }
  return result
}

interface RawQuestion {
  prompt: unknown
  answers: { text: unknown; points: unknown }[]
  where: string
}

function fromJson(text: string, result: ImportResult): RawQuestion[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This JSON file could not be read. Check for missing commas or quotes.')
  }
  let list: unknown = data
  if (isRecord(data)) {
    if (typeof data.title === 'string') result.title = data.title.trim().slice(0, MAX_PROMPT_LENGTH)
    list = data.questions ?? data.rounds
  }
  if (!Array.isArray(list)) {
    throw new Error('JSON must be a list of questions, or an object with a "questions" list.')
  }
  return list.map((item, i) => {
    const where = `Question ${i + 1}`
    if (!isRecord(item)) return { prompt: '', answers: [], where }
    const answers = Array.isArray(item.answers) ? item.answers : []
    return {
      prompt: item.question ?? item.prompt,
      where,
      answers: answers.map((a) =>
        isRecord(a) ? { text: a.text ?? a.answer, points: a.points ?? a.score } : splitAnswerLine(String(a)),
      ),
    }
  })
}

function fromCsv(text: string, result: ImportResult): RawQuestion[] {
  const rows = parseCsv(text)
  const header = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? []
  const col = (names: string[]) => header.findIndex((h) => names.includes(h))
  const qi = col(['question', 'prompt'])
  const ai = col(['answer', 'text'])
  const pi = col(['points', 'score'])
  if (qi < 0 || ai < 0 || pi < 0) {
    throw new Error('CSV needs a header row with question, answer and points columns.')
  }

  const questions: RawQuestion[] = []
  rows.forEach((row, r) => {
    if (row.every((cell) => cell.trim() === '')) return
    const prompt = (row[qi] ?? '').trim()
    const last = questions[questions.length - 1]
    // A blank question cell continues the question above it.
    if (!last || (prompt && prompt !== last.prompt)) {
      questions.push({ prompt, answers: [], where: `CSV row ${r + 2}` })
    }
    const answer = (row[ai] ?? '').trim()
    if (!answer) {
      result.warnings.push(`CSV row ${r + 2} has no answer, so it was skipped.`)
      return
    }
    questions[questions.length - 1].answers.push({ text: answer, points: row[pi] })
  })
  return questions
}

function fromText(text: string, result: ImportResult): RawQuestion[] {
  const blocks = text.split(/\n\s*\n/)
  return blocks.map((block) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const prompt = lines.shift() ?? ''
    const where = `"${truncate(prompt, 40)}"`
    const answers = lines.flatMap((line) => {
      const answer = splitAnswerLine(line)
      if (answer.points === undefined) {
        result.warnings.push(`${where}: "${truncate(line, 40)}" has no points, so it was skipped.`)
        return []
      }
      return [answer]
    })
    return { prompt, answers, where }
  })
}

/** "Sunscreen, 25" / "Sunscreen | 25" / "Sunscreen 25" → text + points. */
function splitAnswerLine(line: string): { text: string; points: string | undefined } {
  const match = line.match(/^(.*?)[\s,;:|\t-]*(\d+)\s*(?:pts?|points)?\.?$/i)
  if (!match || !match[1].trim()) return { text: line.trim(), points: undefined }
  return { text: match[1].trim().replace(/^\d+[.)]\s*/, ''), points: match[2] }
}

function normalize(raw: RawQuestion[], result: ImportResult) {
  for (const q of raw) {
    const prompt = typeof q.prompt === 'string' ? q.prompt.trim() : ''
    if (!prompt) {
      result.errors.push(`${q.where} is missing its question text.`)
      continue
    }
    let answers: Answer[] = []
    for (const a of q.answers) {
      const text = typeof a.text === 'string' ? a.text.trim() : ''
      const points = Number(typeof a.points === 'string' ? a.points.trim() : a.points)
      if (!text) continue
      if (!Number.isInteger(points) || points < 0 || points > MAX_POINTS) {
        result.errors.push(`${q.where}: "${truncate(text, 30)}" needs points as a whole number from 0 to ${MAX_POINTS}.`)
        continue
      }
      if (text.length > MAX_ANSWER_LENGTH) {
        result.warnings.push(`${q.where}: "${truncate(text, 30)}" was shortened to ${MAX_ANSWER_LENGTH} characters.`)
      }
      answers.push({ text: text.slice(0, MAX_ANSWER_LENGTH), points })
    }
    if (answers.length === 0) {
      result.errors.push(`${q.where} has no answers.`)
      continue
    }
    answers.sort((x, y) => y.points - x.points)
    if (answers.length > MAX_ANSWERS) {
      result.warnings.push(`${q.where} has ${answers.length} answers. The board holds ${MAX_ANSWERS}, so the lowest were dropped.`)
      answers = answers.slice(0, MAX_ANSWERS)
    }
    if (result.questions.length === MAX_QUESTIONS) {
      result.warnings.push(`Only the first ${MAX_QUESTIONS} questions were imported.`)
      break
    }
    result.questions.push({ prompt: prompt.slice(0, MAX_PROMPT_LENGTH), answers })
  }
}

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  row.push(field)
  rows.push(row)
  return rows
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

export const CSV_TEMPLATE = `question,answer,points
Name something people bring to the beach,Towel,38
,Sunscreen,24
,Umbrella,14
,Cooler,9
,Book,6
Name a reason you might be late for work,Traffic,45
,Overslept,30
,Car trouble,12
`
