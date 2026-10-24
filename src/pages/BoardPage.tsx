import { useEffect, useRef, useState } from 'react'
import { Logo } from '../components/Logo'
import { Stage } from '../components/Stage'
import { startMusic, stopMusic } from '../music'
import { playBuzzer, playCelebration, playDing, playFanfare, playThemeSting, unlockAudio } from '../sound'
import { loadThemePreference, useLiveState } from '../storage'
import { useDocumentTheme } from '../themes'
import type { LiveState } from '../types'

export function BoardPage() {
  const state = useLiveState()
  const [armed, setArmed] = useState(false)
  useCues(state, armed)
  useTitleMusic(state, armed)
  useDocumentTheme(state?.theme ?? loadThemePreference())

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
        <div className="stage" data-theme={loadThemePreference()}>
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

    // One cue per change; starting play takes priority over whatever started it.
    if (state.phase === 'final' && before.phase !== 'final') {
      playCelebration()
    } else if (before.phase === 'title' && state.phase === 'round') {
      playThemeSting(state.theme)
    } else if (state.strikeNonce > before.strikeNonce) {
      playBuzzer()
    } else if (state.round === before.round && countTrue(state.revealed) > countTrue(before.revealed)) {
      playDing()
    } else if (state.award && !before.award) {
      playFanfare()
    }
  }, [state, enabled])
}

/** Loops theme music while the title screen is up. */
function useTitleMusic(state: LiveState | null, enabled: boolean) {
  const play = enabled && state?.phase === 'title' && state.music
  const theme = state?.theme ?? 'classic'

  useEffect(() => {
    if (play) startMusic(theme)
    else stopMusic()
  }, [play, theme])

  useEffect(() => stopMusic, [])
}

const countTrue = (xs: boolean[]) => xs.filter(Boolean).length
