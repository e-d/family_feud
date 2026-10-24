export function Logo({ size = 'small' }: { size?: 'small' | 'stage' }) {
  return (
    <div className={`logo logo--${size}`} role="img" aria-label="Family Feud">
      <span className="logo__top" aria-hidden>
        Family
      </span>
      <span className="logo__main" aria-hidden>
        Feud
      </span>
    </div>
  )
}
