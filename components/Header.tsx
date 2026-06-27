'use client'

import type { TipoCliente } from '@/lib/types'

export function Header({
  query, onQuery, cartCount, onOpenCart, tipoCliente, onOpenTipoCliente,
}: {
  query: string
  onQuery: (v: string) => void
  cartCount: number
  onOpenCart: () => void
  tipoCliente: TipoCliente | null
  onOpenTipoCliente: () => void
}) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a
          href="#"
          className="brand"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          <div className="brand__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Caccia Bernhard" />
          </div>
          <div>
            <div className="brand__name">Caccia · Bernhard</div>
            <div className="brand__tag">Distribuidora · desde 2019</div>
          </div>
        </a>

        <div className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar alfajor, maní, pan, sorrentinos…"
          />
        </div>

        <div className="header-actions">
          <button className="tipo-cliente-btn" onClick={onOpenTipoCliente} title="Cambiar tipo de cliente">
            <span className="tipo-cliente-btn__dot" />
            {tipoCliente === 'mayorista' ? 'Comercio' : 'Consumidor final'}
          </button>
          <button
            className="icon-btn"
            title="Compartir página web"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.origin : 'https://web-distribuidora.vercel.app'
              const texto = `Mirá el catálogo de Distribuidora Caccia · Bernhard: ${url}`
              window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
            </svg>
          </button>
          <button className="cart-btn" onClick={onOpenCart}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4h2.5l2 12h12l2-9H6" />
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="17" cy="20" r="1.6" />
            </svg>
            Mi carrito
            <span className="cart-btn__count">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
