import { useEffect, useMemo, useRef, useState } from 'react'
import { Logo } from '../components/Logo'
import { PackBrowser } from '../components/PackBrowser'
import { newGame } from '../game'
import { CSV_TEMPLATE, parseQuestions } from '../importer'
import { navigate } from '../router'
import type { Pack } from '../packs'
import { ThemePicker } from '../components/ThemePicker'
import { loadGames, loadLive, loadThemePreference, publishLive, saveGames, saveThemePreference } from '../storage'
import { type ThemeId, useDocumentTheme } from '../themes'
import type { Game } from '../types'

export function LibraryPage() {
  const [games, setGames] = useState<Game[]>(loadGames)
  const [setupId, setSetupId] = useState<string | null>(null)
  const live = useMemo(loadLive, [])
  const [theme, setTheme] = useState<ThemeId>(loadThemePreference)
  useDocumentTheme(theme)

  const chooseTheme = (next: ThemeId) => {
    setTheme(next)
    saveThemePreference(next)
  }

  useEffect(() => {
    document.title = 'Family Feud'
  }, [])

  const update = (next: Game[]) => {
    setGames(next)
    saveGames(next)
  }

  const gamesRef = useRef<HTMLElement>(null)
  const addedPacks = useMemo(() => new Set(games.flatMap((g) => (g.packId ? [g.packId] : []))), [games])

  const openSetup = (game: Game) => {
    setSetupId(game.id)
    if (game.theme) chooseTheme(game.theme)
  }

  const addGame = (game: Game) => {
    update([game, ...games])
    openSetup(game)
  }

  const addPack = (pack: Pack) => {
    addGame({
      id: crypto.randomUUID(),
      title: pack.title,
      questions: pack.questions,
      createdAt: Date.now(),
      packId: pack.id,
      theme: pack.theme,
    })
    gamesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const removeGame = (game: Game) => {
    if (confirm(`Delete “${game.title}”? This can’t be undone.`)) update(games.filter((g) => g.id !== game.id))
  }

  const start = (game: Game, teams: [string, string]) => {
    publishLive(newGame(game, teams, theme))
    navigate('/host')
  }

  return (
    <div className="library">
      <header className="hero">
        <div className="hero__brand">
          <Logo size="stage" />
          <p className="hero__credit">Created by Ed St. Louis</p>
        </div>
        <p className="hero__lede">
          Run a game night from your laptop. Import your survey questions, then put the board up on the TV for everyone
          to see.
        </p>
        {live && (
          <button className="resume" onClick={() => navigate('/host')}>
            <span className="resume__dot" aria-hidden />
            Game in progress: <b>{live.game.title}</b>
            <span className="resume__cta">Resume hosting →</span>
          </button>
        )}
      </header>

      <main className="library-grid">
        <section aria-labelledby="games-heading" ref={gamesRef} className="games">
          <div className="section-head">
            <h2 id="games-heading">Your games</h2>
            {games.length > 0 && (
              <span className="count">
                {games.length} saved
              </span>
            )}
          </div>

          {games.length === 0 ? (
            <div className="empty">
              <p>
                <b>No games yet.</b> Pick a ready-made game, or import your own questions.
              </p>
              <button
                className="btn btn--gold"
                onClick={() => document.getElementById('ready-made')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse ready-made games
              </button>
            </div>
          ) : (
            <ul className="game-list">
              {games.map((game) => (
                <li key={game.id} className="game-card">
                  <div className="game-card__body">
                    <h3>{game.title}</h3>
                    <p className="game-card__meta">
                      {game.questions.length} {game.questions.length === 1 ? 'round' : 'rounds'} · added{' '}
                      {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                    <p className="game-card__first">“{game.questions[0]?.prompt}”</p>
                  </div>
                  {setupId === game.id ? (
                    <TeamSetup
                      theme={theme}
                      onThemeChange={chooseTheme}
                      onStart={(teams) => start(game, teams)}
                      onCancel={() => setSetupId(null)}
                    />
                  ) : (
                    <div className="game-card__actions">
                      <button className="btn btn--gold" onClick={() => openSetup(game)}>
                        Play
                      </button>
                      <button className="btn btn--ghost" onClick={() => removeGame(game)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <ImportPanel onSave={addGame} />
      </main>

      <PackBrowser addedIds={addedPacks} onAdd={addPack} />
    </div>
  )
}

function TeamSetup({
  theme,
  onThemeChange,
  onStart,
  onCancel,
}: {
  theme: ThemeId
  onThemeChange: (theme: ThemeId) => void
  onStart: (teams: [string, string]) => void
  onCancel: () => void
}) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  return (
    <form
      className="team-setup"
      onSubmit={(e) => {
        e.preventDefault()
        onStart([a.trim() || 'Team 1', b.trim() || 'Team 2'])
      }}
    >
      <label>
        <span>Left family</span>
        <input autoFocus value={a} onChange={(e) => setA(e.target.value)} placeholder="Team 1" maxLength={24} />
      </label>
      <span className="team-setup__vs">vs</span>
      <label>
        <span>Right family</span>
        <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Team 2" maxLength={24} />
      </label>
      <div className="team-setup__theme">
        <span>Theme</span>
        <ThemePicker value={theme} onChange={onThemeChange} />
      </div>
      <div className="team-setup__actions">
        <button className="btn btn--gold" type="submit">
          Start game
        </button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const PASTE_EXAMPLE = `Name something people bring to the beach
Towel, 38
Sunscreen, 24
Umbrella, 14

Name a pizza topping
Pepperoni, 48
Mushrooms, 17`

function ImportPanel({ onSave }: { onSave: (game: Game) => void }) {
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [source, setSource] = useState<{ text: string; fileName: string } | null>(null)
  const [title, setTitle] = useState('')
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState('')

  const result = useMemo(() => (source ? parseQuestions(source.text, source.fileName) : null), [source])

  useEffect(() => {
    if (result?.title && !title) setTitle(result.title)
  }, [result, title])

  const readFile = async (file: File | undefined) => {
    if (!file) return
    setFileError('')
    if (file.size > 1_000_000) {
      setSource(null)
      setFileError(`${file.name} is over 1 MB. Question files are usually a few KB, so check you picked the right one.`)
      return
    }
    setSource({ text: await file.text(), fileName: file.name })
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
  }

  const save = () => {
    if (!result || result.questions.length === 0) return
    onSave({
      id: crypto.randomUUID(),
      title: title.trim() || 'Untitled game',
      questions: result.questions,
      createdAt: Date.now(),
    })
    setSource(null)
    setTitle('')
  }

  return (
    <section className="panel import" aria-labelledby="import-heading">
      <h2 id="import-heading">Import a game</h2>

      <label className="field">
        <span>Game name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thanksgiving 2026" maxLength={80} />
      </label>

      <div className="segmented segmented--wide" role="tablist" aria-label="Import method">
        <button role="tab" aria-selected={mode === 'file'} className={mode === 'file' ? 'is-active' : ''} onClick={() => setMode('file')}>
          Upload a file
        </button>
        <button role="tab" aria-selected={mode === 'paste'} className={mode === 'paste' ? 'is-active' : ''} onClick={() => setMode('paste')}>
          Paste text
        </button>
      </div>

      {mode === 'file' ? (
        <label
          className={`dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void readFile(e.dataTransfer.files[0])
          }}
        >
          <input type="file" accept=".csv,.json,.txt,text/csv,application/json,text/plain" onChange={(e) => void readFile(e.target.files?.[0])} />
          <strong>{source?.fileName || 'Drop a file here, or click to choose'}</strong>
          <span>CSV, JSON or plain text</span>
        </label>
      ) : (
        <textarea
          className="paste"
          rows={10}
          placeholder={PASTE_EXAMPLE}
          value={source?.fileName === '' ? source.text : ''}
          onChange={(e) => setSource({ text: e.target.value, fileName: '' })}
          spellCheck={false}
        />
      )}

      {fileError && <p className="notice notice--error">{fileError}</p>}

      {result && (
        <div className="import-result">
          {result.questions.length > 0 && (
            <>
              <p className="import-result__ok">
                <b>{result.questions.length}</b> {result.questions.length === 1 ? 'question' : 'questions'} ready
              </p>
              <ol className="import-result__list">
                {result.questions.map((q, i) => (
                  <li key={i}>
                    <span>{q.prompt}</span>
                    <em>
                      {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}
                    </em>
                  </li>
                ))}
              </ol>
            </>
          )}
          {result.errors.length > 0 && (
            <ul className="notice notice--error">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {result.warnings.length > 0 && (
            <ul className="notice notice--warn">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          <button className="btn btn--gold btn--block" onClick={save} disabled={result.questions.length === 0}>
            Save game
          </button>
        </div>
      )}

      <details className="formats">
        <summary>Supported formats</summary>
        <p>
          <b>Plain text.</b> Question on the first line, then one answer per line with its points. Leave a blank line
          between questions.
        </p>
        <pre>{PASTE_EXAMPLE}</pre>
        <p>
          <b>CSV.</b> Columns <code>question</code>, <code>answer</code>, <code>points</code>. Leave the question blank
          to keep adding answers to the one above.{' '}
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`} download="family-feud-template.csv">
            Download a CSV template
          </a>
        </p>
        <p>
          <b>JSON.</b> A list of questions:
        </p>
        <pre>{`[{
  "question": "Name a pizza topping",
  "answers": [
    { "text": "Pepperoni", "points": 48 }
  ]
}]`}</pre>
        <p>Answers are sorted by points. The board shows up to 8 per question.</p>
      </details>
    </section>
  )
}
