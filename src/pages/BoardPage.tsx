import { useEffect, useRef, useState } from 'react'
import { Logo } from '../components/Logo'
import { Stage } from '../components/Stage'
import { playBuzzer, playDing, playFanfare, unlockAudio } from '../sound'
import { useLiveState } from '../storage'
import type { LiveState } from '../types'

export function BoardPage() {
  const state = useLiveState()
  const [armed, setArmed] = useState(false)
  useCues(state, armed)

  useEffect(() => {
    document.title = 'Family Feud · Board'
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const arm = () => {
    unlockAudio()
    if (!document.fullscreenElement) toggleFullscreen()
    setArmed(true)
  }

  return (
    <div className={`board-page ${armed ? 'is-armed' : ''}`}>
      {state ? (
        <Stage state={state} />
      ) : (
        <div className="stage">
          <div className="stage__spot" aria-hidden />
          <div className="scene scene--title">
            <Logo size="stage" />
            <p className="title__game">Waiting for the host</p>
            <p className="title__hint">Start a game in the host window and it will appear here.</p>
          </div>
        </div>
      )}
      {!armed && (
        <button className="arm-button" onClick={arm}>
          Go full screen with sound
          <kbd>F</kbd>
        </button>
      )}
    </div>
  )
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen?.().catch(() => {})
}

/** Plays sound cues when the host reveals, strikes, or awards. */
function useCues(state: LiveState | null, enabled: boolean) {
  const prev = useRef(state)

  useEffect(() => {
    const before = prev.current
    prev.current = state
    if (!enabled || !state || !before || before.game.id !== state.game.id) return

    if (state.strikeNonce > before.strikeNonce) {
      playBuzzer()
    } else if (state.round === before.round && countTrue(state.revealed) > countTrue(before.revealed)) {
      playDing()
    } else if (state.award && !before.award) {
      playFanfare()
    }
  }, [state, enabled])
}

const countTrue = (xs: boolean[]) => xs.filter(Boolean).length
