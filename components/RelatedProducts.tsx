'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fmtARS, precioPara } from '@/lib/types'
import type { Producto, TipoCliente } from '@/lib/types'
import { ProductMedia } from './ProductMedia'

export function RelatedProducts({
  cartIds, products, tipoCliente, onAdd,
}: {
  cartIds: string[]
  products: Producto[]
  tipoCliente: TipoCliente
  onAdd: (id: string) => void
}) {
  const [related, setRelated] = useState<Producto[]>([])

  useEffect(() => {
    if (cartIds.length === 0) { setRelated([]); return }
    let cancelado = false

    // Pedimos relacionados de hasta los últimos 3 productos del carrito
    // (alcanza para que las sugerencias se sientan frescas sin disparar
    // demasiadas consultas si el carrito es grande).
    const base = cartIds.slice(-3)

    Promise.all(
      base.map((id) => supabase.rpc('productos_relacionados', { p_producto_id: id, p_limit: 6 }))
    ).then((resultados) => {
      if (cancelado) return
      const vistos = new Map<string, Producto & { veces_juntos: number }>()
      for (const r of resultados) {
        for (const p of (r.data ?? []) as (Producto & { veces_juntos: number })[]) {
          if (cartIds.includes(p.id)) continue
          const actual = vistos.get(p.id)
          if (!actual || p.veces_juntos > actual.veces_juntos) vistos.set(p.id, p)
        }
      }
      const lista = Array.from(vistos.values())
        .sort((a, b) => b.veces_juntos - a.veces_juntos)
        .slice(0, 6)
      setRelated(lista)
    })

    return () => { cancelado = true }
  }, [cartIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  if (related.length === 0) return null

  return (
    <div style={{ padding: '16px 24px 4px', borderTop: '1px solid var(--line)' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
        También te puede interesar
      </p>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 14 }}>
        {related.map((p) => {
          const agotado = p.stock_actual <= 0
          return (
            <div key={p.id} style={{ flex: '0 0 110px', display: 'grid', gap: 6 }}>
              <div style={{ width: 110, height: 80, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(160deg, #ffffff 0%, #f1ece2 100%)' }}>
                <ProductMedia p={p} size="thumb" />
              </div>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.25, height: 28, overflow: 'hidden' }}>{p.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)' }}>{fmtARS(precioPara(p, tipoCliente))}</span>
                <button
                  onClick={() => onAdd(p.id)}
                  disabled={agotado}
                  className="card__add"
                  style={{ width: 24, height: 24, fontSize: 14 }}
                  aria-label="Agregar"
                >+</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
