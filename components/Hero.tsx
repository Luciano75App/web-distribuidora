'use client'

import { useEffect, useState } from 'react'
import { STORE } from '@/lib/types'

const PROMOS = [
  { eyebrow: 'ENVÍO SIN CARGO', title: 'Envío gratis desde $30.000', sub: 'En todos tus pedidos a domicilio por Córdoba.', img: 'pan-artesanal-blanco.png', accent: '#2b6cb0', cat: 'all', cta: 'Ver catálogo' },
  { eyebrow: 'RECIÉN LLEGADOS', title: 'Alfajores Mimago', sub: 'Maicena, blanco, negro y black — por unidad o blister.', img: 'alf-maicena-70.jpg', accent: '#a86b3f', cat: 'alfajores', cta: 'Ver alfajores' },
  { eyebrow: 'FRESCAS TODOS LOS DÍAS', title: 'Pastas Bettini & Quiero', sub: 'Sorrentinos, ravioles, capellettis y tapas.', img: 'quiero-sorrentinos.avif', accent: '#e6a23c', cat: 'pastas', cta: 'Ver pastas' },
  { eyebrow: 'DE LA CASA', title: 'Tortas caseras Veneziana', sub: 'Dulce de leche, limón, naranja y chips.', img: 'torta-dulce-de-leche.jpg', accent: '#c66b6b', cat: 'tortas', cta: 'Ver tortas' },
]

function PromoCarousel({ onJump }: { onJump: (cat: string) => void }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = PROMOS.length
  const go = (d: number) => setI((p) => (p + d + n) % n)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setI((p) => (p + 1) % n), 4800)
    return () => clearInterval(id)
  }, [paused, n])

  return (
    <div className="promo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="promo__track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {PROMOS.map((p, k) => (
          <article key={k} className="promo__slide" style={{ '--accent': p.accent } as React.CSSProperties}>
            <div className="promo__text">
              <p className="promo__eyebrow">{p.eyebrow}</p>
              <h3 className="promo__title">{p.title}</h3>
              <p className="promo__sub">{p.sub}</p>
              <button className="promo__cta" onClick={() => onJump(p.cat)}>
                {p.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="promo__badge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={'/productos/' + p.img} alt={p.title} loading="lazy" />
            </div>
          </article>
        ))}
      </div>

      <button className="promo__arrow promo__arrow--prev" onClick={() => go(-1)} aria-label="Anterior">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button className="promo__arrow promo__arrow--next" onClick={() => go(1)} aria-label="Siguiente">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>

      <div className="promo__dots">
        {PROMOS.map((_, k) => (
          <button key={k} className={'promo__dot ' + (k === i ? 'active' : '')} onClick={() => setI(k)} aria-label={`Promo ${k + 1}`} />
        ))}
      </div>
    </div>
  )
}

export function Hero({ onJump }: { onJump: (cat: string) => void }) {
  return (
    <section className="hero">
      <div className="hero__grid">
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

        <PromoCarousel onJump={onJump} />
      </div>
    </section>
  )
}
