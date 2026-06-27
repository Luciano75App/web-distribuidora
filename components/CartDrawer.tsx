'use client'

import { STORE, fmtARS, precioPara } from '@/lib/types'
import type { Producto, TipoCliente } from '@/lib/types'
import { ProductMedia } from './ProductMedia'

interface CartLine extends Producto { qty: number; precio: number }

function LineItem({
  it, onInc, onDec, onRemove,
}: {
  it: CartLine
  onInc: (id: string) => void
  onDec: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="line-item">
      <div className="line-item__thumb">
        <ProductMedia p={it} size="thumb" />
      </div>
      <div>
        <p className="line-item__name">{it.nombre}</p>
        <p className="line-item__unit">{it.presentacion ?? ''} · {fmtARS(it.precio)}</p>
        <div className="line-item__bot">
          <div className="qty">
            <button onClick={() => onDec(it.id)}>−</button>
            <span className="qty__n">{it.qty}</span>
            <button onClick={() => onInc(it.id)}>+</button>
          </div>
          <div className="line-item__price">{fmtARS(it.precio * it.qty)}</div>
        </div>
      </div>
      <button
        className="icon-btn"
        onClick={() => onRemove(it.id)}
        style={{ width: 30, height: 30, alignSelf: 'flex-start' }}
        title="Quitar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </svg>
      </button>
    </div>
  )
}

export function CartDrawer({
  open, onClose, cart, products, onInc, onDec, onRemove, onCheckout, tipoCliente,
}: {
  open: boolean
  onClose: () => void
  cart: Record<string, number>
  products: Producto[]
  onInc: (id: string) => void
  onDec: (id: string) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  tipoCliente: TipoCliente
}) {
  const productMap = new Map(products.map(p => [p.id, p]))
  const items: CartLine[] = Object.keys(cart)
    .map((id) => {
      const p = productMap.get(id)
      return p ? { ...p, qty: cart[id], precio: precioPara(p, tipoCliente) } : null
    })
    .filter((x): x is CartLine => x !== null)

  const subtotal = items.reduce((a, it) => a + it.precio * it.qty, 0)
  const envio = subtotal >= STORE.envioGratisDesde || subtotal === 0 ? 0 : 2500
  const total = subtotal + envio
  const isMayorista = tipoCliente === 'mayorista'
  const cumpleMin = !isMayorista || subtotal >= STORE.minMayorista
  const faltante = STORE.minMayorista - subtotal

  return (
    <>
      <div className={'drawer-backdrop ' + (open ? 'open' : '')} onClick={onClose} />
      <aside className={'drawer ' + (open ? 'open' : '')} aria-hidden={!open}>
        <header className="drawer__head">
          <h3 className="drawer__title">
            Mi carrito <small>{items.length} ítems</small>
          </h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="drawer__body">
          {items.length === 0 ? (
            <div className="drawer__empty">
              <div className="drawer__empty-icon">[ ∅ ]</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>Tu carrito está vacío</div>
              <div style={{ fontSize: 13 }}>Agregá productos del catálogo para empezar tu pedido.</div>
            </div>
          ) : (
            <div className="drawer__items">
              {items.map((it) => (
                <LineItem key={it.id} it={it} onInc={onInc} onDec={onDec} onRemove={onRemove} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="drawer__foot">
            {isMayorista && !cumpleMin && (
              <div className="warn">
                <span>!</span>
                <span>Te faltan <strong>{fmtARS(faltante)}</strong> para alcanzar el mínimo mayorista de {fmtARS(STORE.minMayorista)}.</span>
              </div>
            )}
            {subtotal >= STORE.envioGratisDesde && (
              <div className="success-soft">
                <span>✓</span>
                <span>¡Envío gratis aplicado! Tu pedido supera los {fmtARS(STORE.envioGratisDesde)}.</span>
              </div>
            )}
            <div className="totals">
              <div className="totals__row"><span>Subtotal</span><span>{fmtARS(subtotal)}</span></div>
              <div className="totals__row muted"><span>Envío</span><span>{envio === 0 ? 'GRATIS' : fmtARS(envio)}</span></div>
              <div className="totals__row grand"><span>Total</span><strong>{fmtARS(total)}</strong></div>
            </div>
            <button className="btn" onClick={onCheckout} disabled={isMayorista && !cumpleMin}>
              Confirmar compra
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}
