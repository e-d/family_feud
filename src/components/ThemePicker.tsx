import { THEMES, type ThemeId } from '../themes'

export function ThemePicker({ value, onChange }: { value: ThemeId; onChange: (theme: ThemeId) => void }) {
  return (
    <div className="theme-picker" role="radiogroup" aria-label="Theme">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="radio"
          aria-checked={value === theme.id}
          className={`theme-chip ${value === theme.id ? 'is-active' : ''}`}
          onClick={() => onChange(theme.id)}
        >
          <span className="theme-chip__swatch" aria-hidden>
            {theme.swatch.map((color) => (
              <span key={color} style={{ background: color }} />
            ))}
          </span>
          {theme.name}
        </button>
      ))}
    </div>
  )
}
