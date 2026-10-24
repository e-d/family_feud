import { useEffect, useState } from 'react'
import { type ThemeId, isThemeId } from './themes'
import type { Game, LiveState } from './types'

const GAMES_KEY = 'ff:games'
const LIVE_KEY = 'ff:live'
const THEME_KEY = 'ff:theme'
const CHANNEL = 'ff:live'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the live game still syncs over BroadcastChannel.
  }
}

export function loadGames(): Game[] {
  const games = read<Game[]>(GAMES_KEY, [])
  return Array.isArray(games) ? games : []
}

export function saveGames(games: Game[]) {
  write(GAMES_KEY, games)
}

export function loadLive(): LiveState | null {
  const state = read<LiveState | null>(LIVE_KEY, null)
  // Games saved before themes existed have no theme field.
  return state && { ...state, theme: isThemeId(state.theme) ? state.theme : 'classic' }
}

export function loadThemePreference(): ThemeId {
  const theme = read<unknown>(THEME_KEY, 'classic')
  return isThemeId(theme) ? theme : 'classic'
}

export function saveThemePreference(theme: ThemeId) {
  write(THEME_KEY, theme)
}

let channel: BroadcastChannel | null = null
function getChannel() {
  if (!channel && 'BroadcastChannel' in window) channel = new BroadcastChannel(CHANNEL)
  return channel
}

/** Host side: persist the live game and push it to any open board windows. */
export function publishLive(state: LiveState | null) {
  if (state) write(LIVE_KEY, state)
  else localStorage.removeItem(LIVE_KEY)
  getChannel()?.postMessage(state)
}

/** Board side: the latest live game, kept current from the host window. */
export function useLiveState(): LiveState | null {
  const [state, setState] = useState<LiveState | null>(loadLive)

  useEffect(() => {
    const ch = getChannel()
    const onMessage = (e: MessageEvent<LiveState | null>) => setState(e.data)
    // Fallback for browsers without BroadcastChannel; fires in other tabs on write.
    const onStorage = (e: StorageEvent) => {
      if (e.key === LIVE_KEY) setState(loadLive())
    }
    ch?.addEventListener('message', onMessage)
    window.addEventListener('storage', onStorage)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return state
}
