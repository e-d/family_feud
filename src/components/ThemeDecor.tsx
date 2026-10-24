import type { CSSProperties } from 'react'
import type { ThemeId } from '../themes'

/** Ambient seasonal layer behind the board. Positions are seeded so they don't jump between renders. */
export function ThemeDecor({ theme }: { theme: ThemeId }) {
  switch (theme) {
    case 'halloween':
      return <Halloween />
    case 'thanksgiving':
      return <Falling kind="leaf" count={14} colors={['#d9531e', '#f2a33a', '#b5361b', '#e07b2a', '#8c2f12']} />
    case 'christmas':
      return <Falling kind="flake" count={60} colors={['#ffffff']} />
    case 'valentines':
      return <Falling kind="heart" count={16} colors={['#ff5c8a', '#ff9bb8', '#e8457f', '#ffc1d3']} />
    case 'independence':
      return <Fireworks />
    default:
      return null
  }
}

function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const vars = (v: Record<string, string | number>) => v as CSSProperties

const LEAF = 'M12 1.5C6.5 5.5 4.5 11 6 16c1 3 3.2 4.6 6 5.5 2.8-.9 5-2.5 6-5.5 1.5-5-.5-10.5-6-14.5z'
const HEART = 'M12 21s-7.5-4.6-9.6-9.3C.8 8.1 3 4 6.8 4c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3C21 4 23.2 8.1 21.6 11.7 19.5 16.4 12 21 12 21z'

function Falling({ kind, count, colors }: { kind: 'leaf' | 'flake' | 'heart'; count: number; colors: string[] }) {
  return (
    <div className={`decor decor--${kind}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const duration = kind === 'flake' ? 9 + rand(i, 2) * 10 : 11 + rand(i, 2) * 9
        const size = kind === 'flake' ? 0.25 + rand(i, 3) * 0.6 : 1.6 + rand(i, 3) * 1.8
        const style = vars({
          left: `${rand(i, 1) * 100}%`,
          '--size': `${size}cqw`,
          '--drift': `${(rand(i, 4) - 0.5) * 12}cqw`,
          '--spin': `${(rand(i, 5) > 0.5 ? 1 : -1) * (180 + rand(i, 6) * 360)}deg`,
          animationDuration: `${duration}s`,
          animationDelay: `${-rand(i, 7) * duration}s`,
          opacity: kind === 'flake' ? 0.5 + rand(i, 8) * 0.5 : 0.75,
          color: colors[i % colors.length],
        })
        if (kind === 'flake') return <span key={i} className="decor__item flake" style={style} />
        return (
          <svg key={i} className="decor__item" style={style} viewBox="0 0 24 24">
            {kind === 'leaf' ? (
              <>
                <path d={LEAF} fill="currentColor" />
                <path d="M12 4v19M12 10l-3-2.5M12 10l3-2.5M12 15l-3.5-3M12 15l3.5-3" stroke="rgb(0 0 0 / 0.3)" strokeWidth="0.8" fill="none" />
              </>
            ) : (
              <path d={HEART} fill="currentColor" />
            )}
          </svg>
        )
      })}
    </div>
  )
}

function Halloween() {
  return (
    <div className="decor decor--halloween" aria-hidden>
      <div className="moon" />
      <div className="fog fog--back" />
      <div className="fog fog--front" />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="decor__item bat"
          style={vars({
            top: `${4 + rand(i, 1) * 30}%`,
            '--size': `${3.5 + rand(i, 2) * 2.5}cqw`,
            animationDuration: `${16 + rand(i, 3) * 10}s`,
            animationDelay: `${-rand(i, 4) * 20}s`,
          })}
        >
          <svg viewBox="0 0 64 32">
            <path
              fill="currentColor"
              d="M32 10c1.5-3 2.5-4 3-6 1 2 1 3 .5 4.5C40 6 47 3 54 4c-2 2-2.5 4-2 7 3-1 7-1 10 1-5 1-8 4-9 8-4-3-9-3-13 0-2-2-5-3-8-3s-6 1-8 3c-4-3-9-3-13 0-1-4-4-7-9-8 3-2 7-2 10-1 .5-3 0-5-2-7 7-1 14 2 18.5 4.5C28 7 28 6 29 4c.5 2 1.5 3 3 6z"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

const BURSTS = [
  { x: 9, y: 16, color: '#ff3344' },
  { x: 91, y: 20, color: '#ffffff' },
  { x: 6, y: 74, color: '#4f7dff' },
  { x: 94, y: 70, color: '#ff3344' },
  { x: 50, y: 6, color: '#ffffff' },
]

function Fireworks() {
  return (
    <div className="decor decor--fireworks" aria-hidden>
      {BURSTS.map((b, i) => (
        <div
          key={i}
          className="decor__item burst"
          style={vars({ left: `${b.x}%`, top: `${b.y}%`, color: b.color })}
        >
          {Array.from({ length: 14 }, (_, p) => (
            <span key={p} style={vars({ '--a': `${(p / 14) * 360}deg`, animationDelay: `${i * 0.9}s` })} />
          ))}
        </div>
      ))}
    </div>
  )
}
