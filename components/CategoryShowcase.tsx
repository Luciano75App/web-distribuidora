'use client'

import { useRef } from 'react'
import { CATEGORIAS_BASE } from '@/lib/types'

export function CategoryShowcase({
  active, counts, onSelect,
}: {
  active: string
  counts: Record<string, number>
  onSelect: (id: string) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cats = CATEGORIAS_BASE.filter(c => c.id === 'all' || (counts[c.id] ?? 0) > 0)
  if (cats.length === 0) return null

  function scroll(dir: number) {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <div className="cat-showcase-wrap">
      <section className="cat-showcase">
        <button className="cat-showcase__arrow cat-showcase__arrow--prev" onClick={() => scroll(-1)} aria-label="Anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="cat-showcase__track" ref={trackRef}>
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
        <button className="cat-showcase__arrow cat-showcase__arrow--next" onClick={() => scroll(1)} aria-label="Siguiente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </section>
    </div>
  )
}
