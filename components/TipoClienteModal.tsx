'use client'

import { STORE } from '@/lib/types'
import type { TipoCliente } from '@/lib/types'

export function TipoClienteModal({
  open, onClose, onSelect, current,
}: {
  open: boolean
  onClose: () => void
  onSelect: (tipo: TipoCliente) => void
  current: TipoCliente | null
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && current) onClose() }}>
      <div className="modal" style={{ maxWidth: 560, gridTemplateRows: 'auto auto' }}>
        <header className="modal__head">
          <div className="modal__head-top">
            <h2 className="modal__title">¿Cómo querés ver los precios?</h2>
            {current && (
              <button className="modal__close" onClick={onClose} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
        </header>
        <div className="modal__body">
          <p style={{ color: 'var(--ink-2)', marginTop: 0, marginBottom: 20, fontSize: 14 }}>
            Los precios cambian según seas consumidor final o comercio. Podés cambiarlo cuando quieras desde el botón en la parte superior.
          </p>
          <div className="choice-grid" style={{ marginBottom: 0 }}>
            <button className={'choice ' + (current === 'consumidor' ? 'sel' : '')} onClick={() => onSelect('consumidor')}>
              <span className="choice__icon">◐</span>
              <h3 className="choice__title">Consumidor final</h3>
              <p className="choice__desc">Compro para mi casa o para regalar. Sin mínimo de compra.</p>
            </button>
            <button className={'choice ' + (current === 'mayorista' ? 'sel' : '')} onClick={() => onSelect('mayorista')}>
              <span className="choice__icon">◉</span>
              <h3 className="choice__title">Comerciante / Mayorista</h3>
              <p className="choice__desc">Compro para revender. Mínimo {STORE.minMayorista.toLocaleString('es-AR')} · precios diferenciados.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
