import { useEffect } from 'react'

export type ThemeId = 'classic' | 'halloween' | 'thanksgiving' | 'christmas' | 'valentines' | 'independence'

export interface Theme {
  id: ThemeId
  name: string
  /** Board, accent and background colors for the picker swatch. */
  swatch: [string, string, string]
}

// Colors live in styles.css under [data-theme]; these only drive the picker.
export const THEMES: Theme[] = [
  { id: 'classic', name: 'Classic', swatch: ['#1d44c4', '#ffc53d', '#070a24'] },
  { id: 'halloween', name: 'Halloween', swatch: ['#5a2391', '#ff8a1f', '#06040c'] },
  { id: 'thanksgiving', name: 'Thanksgiving', swatch: ['#a8431a', '#f6b93b', '#140904'] },
  { id: 'christmas', name: 'Christmas', swatch: ['#b3141f', '#f4c84a', '#072615'] },
  { id: 'valentines', name: 'Valentine’s Day', swatch: ['#c2185b', '#ffc1d3', '#16040d'] },
  { id: 'independence', name: 'Independence Day', swatch: ['#c1121f', '#ffffff', '#0a1740'] },
]

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}

/** Themes the whole page (body background, buttons, panels), not just the board. */
export function useDocumentTheme(theme: ThemeId) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
