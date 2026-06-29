'use client'

import { CATEGORIAS_BASE } from '@/lib/types'

export function CategoryShowcase({
  active, counts, onSelect,
}: {
  active: string
  counts: Record<string, number>
  onSelect: (id: string) => void
}) {
  const cats = CATEGORIAS_BASE.filter(c => c.id === 'all' || (counts[c.id] ?? 0) > 0)
  if (cats.length === 0) return null

  return (
    <div className="cat-showcase-wrap">
      <section className="cat-showcase">
        <div className="cat-showcase__track">
          {cats.map((c) => (
            <button
              key={c.id}
              className={'cat-showcase__item ' + (active === c.id ? 'active' : '')}
              onClick={() => onSelect(c.id)}
              style={{ '--accent': c.accent } as React.CSSProperties}
            >
              <span className="cat-showcase__icon">{c.icon}</span>
              <span className="cat-showcase__label">{c.label}</span>
              <span className="cat-showcase__count">{counts[c.id] ?? 0} productos</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
