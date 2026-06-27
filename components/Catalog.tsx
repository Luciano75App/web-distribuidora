'use client'

import { CATEGORIAS_BASE, fmtARS, precioPara } from '@/lib/types'
import type { Producto, TipoCliente } from '@/lib/types'
import { ProductMedia } from './ProductMedia'

function ProductCard({
  p, qty, onAdd, onInc, onDec, tipoCliente,
}: {
  p: Producto
  qty: number
  onAdd: (id: string) => void
  onInc: (id: string) => void
  onDec: (id: string) => void
  tipoCliente: TipoCliente
}) {
  const cat = CATEGORIAS_BASE.find((c) => c.id === (p.categoria ?? 'otros')) ?? CATEGORIAS_BASE[0]
  const inCart = qty > 0
  const agotado = p.stock_actual <= 0

  return (
    <article className="card" style={{ '--accent': cat.accent } as React.CSSProperties}>
      <div className="card__media">
        <ProductMedia p={p} />
        {agotado && <span className="card__tag">sin stock</span>}
      </div>
      <div className="card__body">
        <div className="card__cat">{p.marca ? p.marca : cat.label}</div>
        <h3 className="card__name">{p.nombre}</h3>
        <div className="card__unit">{p.presentacion ?? p.unidad_medida ?? ''}</div>
        <div className="card__foot">
          <div className="card__price">
            {fmtARS(precioPara(p, tipoCliente))}
            <span className="card__price-unit"> /u</span>
          </div>
          {agotado ? (
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>agotado</span>
          ) : inCart ? (
            <div className="qty">
              <button onClick={() => onDec(p.id)}>−</button>
              <span className="qty__n">{qty}</span>
              <button onClick={() => onInc(p.id)}>+</button>
            </div>
          ) : (
            <button className="card__add" onClick={() => onAdd(p.id)} aria-label="Agregar">+</button>
          )}
        </div>
      </div>
    </article>
  )
}

export function Catalog({
  cat, query, cart, products, onAdd, onInc, onDec, tipoCliente,
}: {
  cat: string
  query: string
  cart: Record<string, number>
  products: Producto[]
  onAdd: (id: string) => void
  onInc: (id: string) => void
  onDec: (id: string) => void
  tipoCliente: TipoCliente
}) {
  const catObj = CATEGORIAS_BASE.find((c) => c.id === cat) ?? CATEGORIAS_BASE[0]
  const q = query.trim().toLowerCase()

  const filtered = products.filter((p) => {
    if (cat !== 'all' && (p.categoria ?? 'otros') !== cat) return false
    if (q && !(p.nombre + ' ' + (p.marca || '')).toLowerCase().includes(q)) return false
    return true
  })

  return (
    <section className="catalog" id="catalog">
      <header className="catalog__header">
        <h2 className="catalog__title">{cat === 'all' ? 'Todo el catálogo' : catObj.label}</h2>
        <div className="catalog__meta">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          {q && <> · buscando &quot;{query}&quot;</>}
        </div>
      </header>

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} qty={cart[p.id] || 0} onAdd={onAdd} onInc={onInc} onDec={onDec} tipoCliente={tipoCliente} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ fontFamily: 'var(--mono)', letterSpacing: '.2em', marginBottom: 8 }}>SIN RESULTADOS</div>
          <div style={{ fontSize: 13 }}>Probá con otra categoría o limpiá la búsqueda.</div>
        </div>
      )}
    </section>
  )
}
