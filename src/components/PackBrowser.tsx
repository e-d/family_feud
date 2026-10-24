import { useState } from 'react'
import { PACKS, PACK_CATEGORIES, type Pack, type PackCategory } from '../packs'
import { THEMES } from '../themes'

export function PackBrowser({ addedIds, onAdd }: { addedIds: Set<string>; onAdd: (pack: Pack) => void }) {
  const [category, setCategory] = useState<PackCategory | 'All'>('All')
  const shown = category === 'All' ? PACKS : PACKS.filter((p) => p.category === category)

  return (
    <section className="packs" id="ready-made" aria-labelledby="packs-heading">
      <div className="section-head">
        <h2 id="packs-heading">Ready-made games</h2>
        <span className="count">{PACKS.length} games</span>
      </div>

      <div className="chips" role="group" aria-label="Filter by category">
        {(['All', ...PACK_CATEGORIES] as const).map((c) => (
          <button key={c} className={`chip ${category === c ? 'is-active' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <ul className="pack-grid">
        {shown.map((pack) => {
          const added = addedIds.has(pack.id)
          const theme = THEMES.find((t) => t.id === pack.theme)
          return (
            <li key={pack.id} className="pack-card">
              <span className="eyebrow">{pack.category}</span>
              <h3>{pack.title}</h3>
              <p className="pack-card__blurb">{pack.blurb}</p>
              <p className="pack-card__sample">“{pack.questions[0].prompt}”</p>
              <div className="pack-card__foot">
                <span className="pack-card__meta">
                  {pack.questions.length} rounds
                  {theme && (
                    <>
                      {' · '}
                      <span className="pack-card__theme">
                        <span className="theme-chip__swatch" aria-hidden>
                          {theme.swatch.map((color) => (
                            <span key={color} style={{ background: color }} />
                          ))}
                        </span>
                        {theme.name} theme
                      </span>
                    </>
                  )}
                </span>
                <button className={`btn ${added ? 'btn--ghost' : 'btn--gold'}`} onClick={() => onAdd(pack)} disabled={added}>
                  {added ? 'Added ✓' : 'Add to my games'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
