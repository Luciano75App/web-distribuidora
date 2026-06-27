'use client'

import { useEffect, useState } from 'react'
import { STORE, fmtARS, precioPara } from '@/lib/types'
import type { Producto, Promo, TipoCliente } from '@/lib/types'
import { ProductMedia } from './ProductMedia'

function PromoCarousel({
  promos, products, onAdd, tipoCliente,
}: {
  promos: Promo[]
  products: Producto[]
  onAdd: (id: string) => void
  tipoCliente: TipoCliente
}) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = promos.length
  const go = (d: number) => setI((p) => (p + d + n) % n)

  useEffect(() => {
    if (paused || n <= 1) return
    const id = setInterval(() => setI((p) => (p + 1) % n), 4800)
    return () => clearInterval(id)
  }, [paused, n])

  if (n === 0) return null

  return (
    <div className="promo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="promo__track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {promos.map((p) => {
          const producto = p.producto_id ? products.find(pr => pr.id === p.producto_id) : undefined
          const agotado = producto && producto.stock_actual <= 0
          return (
            <article key={p.id} className="promo__slide" style={{ '--accent': '#e8c468' } as React.CSSProperties}>
              <div className="promo__text">
                {producto && <p className="promo__eyebrow">{fmtARS(precioPara(producto, tipoCliente))}</p>}
                <h3 className="promo__title">{p.titulo}</h3>
                {p.texto && <p className="promo__sub">{p.texto}</p>}
                {producto && (
                  <button className="promo__cta" onClick={() => onAdd(producto.id)} disabled={agotado}>
                    {agotado ? 'Sin stock' : 'Agregar al carrito'}
                    {!agotado && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    )}
                  </button>
                )}
              </div>
              <div className="promo__badge">
                {producto ? (
                  <ProductMedia p={producto} />
                ) : p.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_url} alt={p.titulo} loading="lazy" />
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      {n > 1 && (
        <>
          <button className="promo__arrow promo__arrow--prev" onClick={() => go(-1)} aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button className="promo__arrow promo__arrow--next" onClick={() => go(1)} aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <div className="promo__dots">
            {promos.map((p, k) => (
              <button key={p.id} className={'promo__dot ' + (k === i ? 'active' : '')} onClick={() => setI(k)} aria-label={`Promo ${k + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Hero({
  promos, products, onAddPromo, tipoCliente,
}: {
  promos: Promo[]
  products: Producto[]
  onAddPromo: (id: string) => void
  tipoCliente: TipoCliente
}) {
  return (
    <section className="hero">
      <div className="hero__grid" style={promos.length === 0 ? { gridTemplateColumns: '1fr' } : undefined}>
        <div className="hero__card">
          <p className="hero__eyebrow">◆ MAYORISTA & MINORISTA · CÓRDOBA</p>
          <h1 className="hero__title">
            Distribuimos productos de calidad con eficiencia.<br />
            <em>Maní, pan, pastas y más</em> — desde 2019.
          </h1>
          <p className="hero__desc">
            Distribuimos maní 38/42, panificados Mimago y Veneziana, pastas Bettini y Quiero,
            y almacén Jumala a comercios y consumidores finales. Pedís, confirmamos por WhatsApp y entregamos a domicilio.
          </p>
          <div className="hero__meta">
            <div className="hero__meta-item">
              <div>
                <p className="hero__meta-key">Pedido mínimo mayorista</p>
                <p className="hero__meta-val">$30.000</p>
              </div>
            </div>
            <div className="hero__meta-item">
              <div>
                <p className="hero__meta-key">Envío gratis</p>
                <p className="hero__meta-val">Desde $30.000</p>
              </div>
            </div>
            <div className="hero__meta-item">
              <div>
                <p className="hero__meta-key">Pago</p>
                <p className="hero__meta-val">Efectivo contra entrega</p>
              </div>
            </div>
            <div className="hero__meta-item">
              <div>
                <p className="hero__meta-key">WhatsApp</p>
                <p className="hero__meta-val">{STORE.whatsappFmt}</p>
              </div>
            </div>
          </div>
        </div>

        {promos.length > 0 && <PromoCarousel promos={promos} products={products} onAdd={onAddPromo} tipoCliente={tipoCliente} />}
      </div>
    </section>
  )
}
