import { useEffect, useRef, useState } from 'react'
import { MAX_ANSWERS, bank, currentQuestion } from '../game'
import type { Answer, LiveState } from '../types'
import { Logo } from './Logo'

/** The audience-facing board. Pure render of the live state, sized in container units so it scales to any screen. */
export function Stage({ state }: { state: LiveState }) {
  return (
    <div className="stage">
      <div className="stage__spot" aria-hidden />
      {state.phase === 'title' && <TitleScene state={state} />}
      {state.phase === 'round' && <RoundScene state={state} />}
      {state.phase === 'final' && <FinalScene state={state} />}
      <StrikeOverlay strikes={state.strikes} nonce={state.strikeNonce} />
    </div>
  )
}

function TitleScene({ state }: { state: LiveState }) {
  return (
    <div className="scene scene--title" key="title">
      <Logo size="stage" />
      <p className="title__game">{state.game.title}</p>
      <p className="title__teams">
        <span>{state.teams[0].name}</span>
        <em>vs</em>
        <span>{state.teams[1].name}</span>
      </p>
    </div>
  )
}

function RoundScene({ state }: { state: LiveState }) {
  const question = currentQuestion(state)
  const slots: (Answer | null)[] = Array.from({ length: MAX_ANSWERS }, (_, i) => question.answers[i] ?? null)
  const rows = MAX_ANSWERS / 2
  const total = state.game.questions.length

  return (
    <div className="scene scene--round" key="round">
      <div className="scorebar">
        <TeamScore team={state.teams[0]} winning={state.award?.team === 0} />
        <div className="bank">
          <span className="bank__label">
            Round {state.round + 1} of {total}
            {state.multiplier > 1 && <b className="bank__mult">{state.multiplier === 2 ? 'Double' : 'Triple'}</b>}
          </span>
          <CountUp className="bank__value" value={bank(state)} />
        </div>
        <TeamScore team={state.teams[1]} winning={state.award?.team === 1} />
      </div>

      <div className="marquee">
        <Bulbs />
        <div className="board" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {slots.map((answer, i) => (
            <Tile key={`${state.round}-${i}`} number={i + 1} answer={answer} revealed={!!state.revealed[i]} />
          ))}
        </div>
      </div>

      <div className="stage__footer">
        <p className={`question ${state.showQuestion ? 'is-visible' : ''}`}>{question.prompt}</p>
        <div className="strike-lights" aria-label={`${state.strikes} strikes`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < state.strikes ? 'is-on' : ''}>
              ✕
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function FinalScene({ state }: { state: LiveState }) {
  const [a, b] = state.teams
  const tie = a.score === b.score
  const winner = a.score > b.score ? a : b
  return (
    <div className="scene scene--final" key="final">
      <Logo size="small" />
      <p className="final__eyebrow">{tie ? 'It’s a tie!' : 'And the winner is'}</p>
      {!tie && <p className="final__name">{winner.name}</p>}
      <div className="final__scores">
        {state.teams.map((t, i) => (
          <div key={i}className={`final__team ${!tie && t === winner ? 'is-winner' : ''}`}>
            <span>{t.name}</span>
            <CountUp value={t.score} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamScore({ team, winning }: { team: LiveState['teams'][number]; winning: boolean }) {
  return (
    <div className={`team ${winning ? 'is-winning' : ''}`}>
      <span className="team__name">{team.name}</span>
      <CountUp className="team__score" value={team.score} />
    </div>
  )
}

function Tile({ number, answer, revealed }: { number: number; answer: Answer | null; revealed: boolean }) {
  if (!answer) return <div className="tile tile--empty" />
  const long = answer.text.length > 22 ? 'is-xlong' : answer.text.length > 14 ? 'is-long' : ''
  return (
    <div className={`tile ${revealed ? 'is-revealed' : ''}`}>
      <div className="tile__inner">
        <div className="tile__face tile__front">
          <span className="tile__num">{number}</span>
        </div>
        <div className="tile__face tile__back">
          <span className={`tile__text ${long}`}>{answer.text}</span>
          <span className="tile__pts">{answer.points}</span>
        </div>
      </div>
    </div>
  )
}

const BULBS_X = 30
const BULBS_Y = 11

/** Chasing marquee lights around the board. */
function Bulbs() {
  const bulbs: { side: string; t: number }[] = []
  for (let i = 0; i < BULBS_X; i++) bulbs.push({ side: 'top', t: i / (BULBS_X - 1) })
  for (let i = 1; i < BULBS_Y - 1; i++) bulbs.push({ side: 'right', t: i / (BULBS_Y - 1) })
  for (let i = BULBS_X - 1; i >= 0; i--) bulbs.push({ side: 'bottom', t: i / (BULBS_X - 1) })
  for (let i = BULBS_Y - 2; i > 0; i--) bulbs.push({ side: 'left', t: i / (BULBS_Y - 1) })
  return (
    <div className="bulbs" aria-hidden>
      {bulbs.map((b, i) => (
        <span key={i} className={`bulb bulb--${b.side} bulb--p${i % 3}`} style={{ '--t': b.t } as React.CSSProperties} />
      ))}
    </div>
  )
}

function StrikeOverlay({ strikes, nonce }: { strikes: number; nonce: number }) {
  const [visible, setVisible] = useState(false)
  const seen = useRef(nonce)

  useEffect(() => {
    if (nonce === seen.current) return
    seen.current = nonce
    setVisible(true)
    const id = setTimeout(() => setVisible(false), 1400)
    return () => clearTimeout(id)
  }, [nonce])

  if (!visible) return null
  return (
    <div className="strike-overlay" key={nonce} role="alert">
      {Array.from({ length: Math.max(1, strikes) }, (_, i) => (
        <span key={i} style={{ animationDelay: `${i * 70}ms` }}>
          ✕
        </span>
      ))}
    </div>
  )
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function CountUp({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    if (start === value || reducedMotion()) {
      from.current = value
      setShown(value)
      return
    }
    const began = performance.now()
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - began) / 800)
      const v = Math.round(start + (value - start) * (1 - (1 - p) ** 3))
      from.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span className={className}>{shown}</span>
}
