'use client'

import { useEffect, useMemo, useState } from 'react'
import { CATEGORIAS_BASE, STORE } from '@/lib/types'
import type { Producto, Promo, TipoCliente } from '@/lib/types'
import { Header } from './Header'
import { Hero } from './Hero'
import { CategoryShowcase } from './CategoryShowcase'
import { CategoryBar } from './CategoryBar'
import { Catalog } from './Catalog'
import { CartDrawer } from './CartDrawer'
import { Checkout } from './Checkout'
import { Footer } from './Footer'
import { TipoClienteModal } from './TipoClienteModal'

const LS_KEY = 'cb_tipo_cliente'
const LS_REF_KEY = 'cb_vendedor_ref'

export function Storefront({
  products, promos, vendedorRef,
}: {
  products: Producto[]
  promos: Promo[]
  vendedorRef: string | null
}) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [tipoCliente, setTipoCliente] = useState<TipoCliente | null>(null)
  const [tipoModalOpen, setTipoModalOpen] = useState(false)
  const [vendedorId, setVendedorId] = useState<string | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_KEY)
    if (saved === 'consumidor' || saved === 'mayorista') {
      setTipoCliente(saved)
    } else {
      setTipoModalOpen(true)
    }
  }, [])

  // Atribución de vendedor: si llega ?ref= en la URL, queda guardado para
  // todo lo que el visitante compre en esta sesión (aunque navegue sin el parámetro).
  useEffect(() => {
    if (vendedorRef) {
      window.localStorage.setItem(LS_REF_KEY, vendedorRef)
      setVendedorId(vendedorRef)
    } else {
      setVendedorId(window.localStorage.getItem(LS_REF_KEY))
    }
  }, [vendedorRef])

  function selectTipoCliente(tipo: TipoCliente) {
    setTipoCliente(tipo)
    window.localStorage.setItem(LS_KEY, tipo)
    setTipoModalOpen(false)
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length }
    for (const cat of CATEGORIAS_BASE) if (cat.id !== 'all') c[cat.id] = 0
    for (const p of products) {
      const catId = p.categoria ?? 'otros'
      c[catId] = (c[catId] || 0) + 1
    }
    return c
  }, [products])

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  function add(id: string) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })) }
  function addFromPromo(id: string) { add(id); setCartOpen(true) }
  function inc(id: string) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })) }
  function dec(id: string) {
    setCart((c) => {
      const n = (c[id] || 0) - 1
      if (n <= 0) { const { [id]: _drop, ...rest } = c; return rest }
      return { ...c, [id]: n }
    })
  }
  function remove(id: string) { setCart((c) => { const { [id]: _drop, ...rest } = c; return rest }) }

  function goCheckout() {
    setCartOpen(false)
    setTimeout(() => setCheckoutOpen(true), 200)
  }
  function clearCart() { setCart({}) }

  function jumpToCat(id: string) {
    setActiveCat(id)
    setTimeout(() => {
      const el = document.getElementById('catalog')
      if (el) window.scrollTo({ top: el.offsetTop - 130, behavior: 'smooth' })
    }, 50)
  }

  const tipoEfectivo: TipoCliente = tipoCliente ?? 'consumidor'

  return (
    <>
      <Header
        query={query} onQuery={setQuery} cartCount={cartCount} onOpenCart={() => setCartOpen(true)}
        tipoCliente={tipoCliente} onOpenTipoCliente={() => setTipoModalOpen(true)}
      />

      <Hero promos={promos} products={products} onAddPromo={addFromPromo} tipoCliente={tipoEfectivo} />

      <CategoryShowcase counts={counts} onSelect={jumpToCat} />

      <CategoryBar active={activeCat} onSelect={setActiveCat} counts={counts} />

      <Catalog cat={activeCat} query={query} cart={cart} products={products} onAdd={add} onInc={inc} onDec={dec} tipoCliente={tipoEfectivo} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onCheckout={goCheckout}
        tipoCliente={tipoEfectivo}
        onAdd={add}
      />

      <Checkout
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        products={products}
        onClearCart={clearCart}
        tipoCliente={tipoEfectivo}
        vendedorId={vendedorId}
      />

      <TipoClienteModal
        open={tipoModalOpen}
        onClose={() => setTipoModalOpen(false)}
        onSelect={selectTipoCliente}
        current={tipoCliente}
      />

      <a className="wa-float" href={`https://wa.me/54${STORE.whatsapp}`} target="_blank" rel="noopener" title="Hablar por WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1.1-1.1 2.6 1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.8 3.2 1.3 3.2.9 3.8.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z" />
          <path d="M20.5 3.5C18.3 1.2 15.3 0 12.1 0 5.5 0 .1 5.4.1 12c0 2.1.5 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.8 1.4h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.3zM12 22c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.5 15.7 2 13.9 2 12 2 6.5 6.5 2 12 2c2.7 0 5.2 1 7.1 2.9 1.9 1.9 2.9 4.4 2.9 7.1 0 5.5-4.5 10-10 10z" />
        </svg>
      </a>

      <Footer />
    </>
  )
}
