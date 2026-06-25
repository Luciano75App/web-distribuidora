'use client'

import { useState } from 'react'
import { CATEGORIAS_BASE } from '@/lib/types'
import type { Producto } from '@/lib/types'

function ProductPlaceholder({ p, size = 'card' }: { p: Producto; size?: 'card' | 'thumb' }) {
  const cat = CATEGORIAS_BASE.find(c => c.id === (p.categoria ?? 'otros')) ?? CATEGORIAS_BASE[CATEGORIAS_BASE.length - 1]
  const accent = cat.accent
  const compact = size === 'thumb'

  if (compact) {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">
        <circle cx="60" cy="60" r="34" fill={accent} fillOpacity="0.12" />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fill={accent} fontFamily="Fraunces, serif" fontSize="34">
          {cat.icon}
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      <circle cx="200" cy="124" r="50" fill={accent} fillOpacity="0.12" />
      <circle cx="200" cy="124" r="50" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="200" y="124" textAnchor="middle" dominantBaseline="central" fill={accent} fontFamily="Fraunces, serif" fontSize="46">
        {cat.icon}
      </text>
      {p.marca && (
        <text x="200" y="210" textAnchor="middle" fill="#8a8678" fontFamily="JetBrains Mono, monospace" fontSize="12" letterSpacing="3">
          {p.marca.toUpperCase()}
        </text>
      )}
      <text x="200" y="240" textAnchor="middle" fill="#3a3a36" fontFamily="Manrope, sans-serif" fontSize="15" fontWeight="600">
        {p.nombre.length > 30 ? p.nombre.slice(0, 28) + '…' : p.nombre}
      </text>
    </svg>
  )
}

export function ProductMedia({ p, size = 'card' }: { p: Producto & { imagen_url?: string | null }; size?: 'card' | 'thumb' }) {
  const [failed, setFailed] = useState(false)
  if (p.imagen_url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className={'product-img' + (size === 'thumb' ? ' thumb' : '')}
        src={p.imagen_url}
        alt={p.nombre}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }
  return <ProductPlaceholder p={p} size={size} />
}
