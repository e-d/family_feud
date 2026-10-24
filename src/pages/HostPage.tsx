import { useCallback, useEffect, useState } from 'react'
import { Logo } from '../components/Logo'
import { Stage } from '../components/Stage'
import { type Action, MAX_STRIKES, bank, currentQuestion, reduce } from '../game'
import { loadLive, publishLive } from '../storage'
import type { LiveState, Multiplier, Phase } from '../types'
import { navigate } from '../router'

export function HostPage() {
  const [state, setState] = useState<LiveState | null>(loadLive)
  const dispatch = useCallback((action: Action) => setState((s) => (s ? reduce(s, action) : s)), [])

  useEffect(() => {
    if (state) publishLive(state)
  }, [state])

  useEffect(() => {
    document.title = 'Family Feud · Host'
  }, [])

  useShortcuts(state, dispatch)

  if (!state) {
    return (
      <div className="host-empty">
        <Logo />
        <h1>No game in progress</h1>
        <p>Pick a game from your library to start hosting.</p>
        <button className="btn btn--gold" onClick={() => navigate('/')}>
          Go to your games
        </button>
      </div>
    )
  }

  const question = currentQuestion(state)
  const total = state.game.questions.length
  const pot = bank(state)

  const endGame = () => {
    if (!confirm('End this game? Scores will be cleared from the board.')) return
    publishLive(null)
    navigate('/')
  }

  return (
    <div className="host">
      <header className="host-bar">
        <button className="host-bar__home" onClick={() => navigate('/')} aria-label="Back to your games">
          <Logo />
        </button>
        <div className="host-bar__title">
          <span className="eyebrow">Now hosting</span>
          <strong>{state.game.title}</strong>
        </div>
        <div className="host-bar__actions">
          <button className="btn btn--gold" onClick={openBoard}>
            Open TV board ↗
          </button>
          <button className="btn btn--ghost" onClick={endGame}>
            End game
          </button>
        </div>
      </header>

      <main className="host-grid">
        <section className="panel round-panel" aria-label="Round controls">
          <div className="round-panel__nav">
            <button
              className="btn btn--icon"
              onClick={() => dispatch({ type: 'goToRound', round: state.round - 1 })}
              disabled={state.round === 0}
              aria-label="Previous round"
            >
              ←
            </button>
            <span className="eyebrow">
              Round {state.round + 1} of {total}
            </span>
            <button
              className="btn btn--icon"
              onClick={() => dispatch({ type: 'goToRound', round: state.round + 1 })}
              disabled={state.round === total - 1}
              aria-label="Next round"
            >
              →
            </button>
          </div>

          <h1 className="round-panel__question">{question.prompt}</h1>
          <label className="switch">
            <input type="checkbox" checked={state.showQuestion} onChange={() => dispatch({ type: 'toggleQuestion' })} />
            <span className="switch__track" aria-hidden />
            Show question on TV <kbd>Q</kbd>
          </label>

          <ol className="answer-list">
            {question.answers.map((a, i) => (
              <li key={i}>
                <button
                  className={`answer-row ${state.revealed[i] ? 'is-revealed' : ''}`}
                  onClick={() => dispatch({ type: 'reveal', index: i })}
                  aria-pressed={!!state.revealed[i]}
                >
                  <span className="answer-row__num">{i + 1}</span>
                  <span className="answer-row__text">{a.text}</span>
                  <span className="answer-row__pts">{a.points}</span>
                  <span className="answer-row__state">{state.revealed[i] ? 'Hide' : 'Reveal'}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="control-row">
            <button className="btn btn--strike" onClick={() => dispatch({ type: 'strike' })}>
              ✕ Strike <kbd>X</kbd>
            </button>
            <div className="strike-pips" aria-label={`${state.strikes} of ${MAX_STRIKES} strikes`}>
              {Array.from({ length: MAX_STRIKES }, (_, i) => (
                <span key={i} className={i < state.strikes ? 'is-on' : ''} />
              ))}
            </div>
            <button className="btn btn--ghost" onClick={() => dispatch({ type: 'clearStrikes' })} disabled={!state.strikes}>
              Clear strikes
            </button>
            <button className="btn btn--ghost push-right" onClick={() => dispatch({ type: 'revealAll' })}>
              Reveal all
            </button>
          </div>

          <div className="award">
            <div className="award__bank">
              <span className="eyebrow">Bank</span>
              <strong>{pot}</strong>
              <div className="segmented" role="group" aria-label="Point multiplier">
                {([1, 2, 3] as Multiplier[]).map((m) => (
                  <button
                    key={m}
                    className={state.multiplier === m ? 'is-active' : ''}
                    onClick={() => dispatch({ type: 'setMultiplier', multiplier: m })}
                  >
                    ×{m}
                  </button>
                ))}
              </div>
            </div>
            {state.award ? (
              <div className="award__done">
                <span>
                  <b>{state.teams[state.award.team].name}</b> took {state.award.points} points
                </span>
                <button className="btn btn--ghost" onClick={() => dispatch({ type: 'undoAward' })}>
                  Undo
                </button>
              </div>
            ) : (
              <div className="award__buttons">
                {state.teams.map((t, i) => (
                  <button
                    key={i}
                    className="btn btn--blue"
                    disabled={pot === 0}
                    onClick={() => dispatch({ type: 'award', team: i as 0 | 1 })}
                  >
                    Give bank to {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="host-side">
          <section className="panel">
            <div className="panel__head">
              <span className="eyebrow">On the TV</span>
              <div className="segmented" role="group" aria-label="Board screen">
                {(
                  [
                    ['title', 'Title'],
                    ['round', 'Board'],
                    ['final', 'Final scores'],
                  ] as [Phase, string][]
                ).map(([phase, label]) => (
                  <button
                    key={phase}
                    className={state.phase === phase ? 'is-active' : ''}
                    onClick={() => dispatch({ type: 'setPhase', phase })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="preview">
              <Stage state={state} />
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">Teams</span>
            <div className="teams-edit">
              {state.teams.map((t, i) => {
                const team = i as 0 | 1
                return (
                  <div key={i} className="team-edit">
                    <input
                      aria-label={`Team ${i + 1} name`}
                      value={t.name}
                      maxLength={24}
                      onChange={(e) => dispatch({ type: 'renameTeam', team, name: e.target.value })}
                    />
                    <div className="team-edit__score">
                      <button className="btn btn--icon" onClick={() => dispatch({ type: 'adjustScore', team, delta: -5 })}>
                        −5
                      </button>
                      <strong>{t.score}</strong>
                      <button className="btn btn--icon" onClick={() => dispatch({ type: 'adjustScore', team, delta: 5 })}>
                        +5
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="panel shortcuts">
            <span className="eyebrow">Keyboard</span>
            <dl>
              <dt>
                <kbd>1</kbd>–<kbd>8</kbd>
              </dt>
              <dd>Reveal or hide an answer</dd>
              <dt>
                <kbd>X</kbd>
              </dt>
              <dd>Strike</dd>
              <dt>
                <kbd>Q</kbd>
              </dt>
              <dd>Show or hide the question</dd>
              <dt>
                <kbd>←</kbd> <kbd>→</kbd>
              </dt>
              <dd>Previous or next round</dd>
            </dl>
          </section>
        </aside>
      </main>
    </div>
  )
}

function openBoard() {
  const url = `${location.origin}${location.pathname}#/board`
  window.open(url, 'ff-board', 'popup,width=1280,height=720')
}

function useShortcuts(state: LiveState | null, dispatch: (a: Action) => void) {
  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.metaKey || e.ctrlKey || e.altKey || target.closest('input, textarea, select')) return
      const key = e.key.toLowerCase()
      const n = Number(key)
      if (n >= 1 && n <= currentQuestion(state).answers.length) dispatch({ type: 'reveal', index: n - 1 })
      else if (key === 'x') dispatch({ type: 'strike' })
      else if (key === 'q') dispatch({ type: 'toggleQuestion' })
      else if (key === 'arrowright') dispatch({ type: 'goToRound', round: state.round + 1 })
      else if (key === 'arrowleft') dispatch({ type: 'goToRound', round: state.round - 1 })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, dispatch])
}
