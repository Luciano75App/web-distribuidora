'use client'

import { CATEGORIAS_BASE } from '@/lib/types'

export function CategoryBar({
  active, onSelect, counts,
}: {
  active: string
  onSelect: (id: string) => void
  counts: Record<string, number>
}) {
  const cats = CATEGORIAS_BASE.filter(c => c.id === 'all' || (counts[c.id] ?? 0) > 0)
  return (
    <div className="cat-bar-wrap">
      <div className="cat-bar">
        {cats.map((c) => (
          <button
            key={c.id}
            className={'cat-pill ' + (active === c.id ? 'active' : '')}
            onClick={() => onSelect(c.id)}
            style={{ '--accent': c.accent } as React.CSSProperties}
          >
            <span className="cat-pill__dot" />
            {c.label}
            <span className="cat-pill__count">{counts[c.id] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
