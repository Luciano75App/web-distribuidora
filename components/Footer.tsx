import { CATEGORIAS_BASE, STORE } from '@/lib/types'

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <div className="foot__col">
          <h5>Distribuidora</h5>
          <p className="foot__brand">Caccia · Bernhard</p>
          <p>Mayorista y minorista de maní, panificados, pastas frescas y almacén. Repartos por Córdoba Capital y alrededores.</p>
          <p style={{ marginTop: 10, color: 'var(--ink-3)', fontSize: 12 }}>{STORE.address}</p>
        </div>
        <div className="foot__col">
          <h5>Categorías</h5>
          {CATEGORIAS_BASE.filter(c => c.id !== 'all' && c.id !== 'otros').slice(0, 5).map(c => (
            <a key={c.id} href={`#${c.id}`}>{c.label}</a>
          ))}
        </div>
        <div className="foot__col">
          <h5>Contacto</h5>
          <p>WhatsApp · {STORE.whatsappFmt}</p>
          <p>{STORE.address}</p>
          <p>Lun a Vie · 8 a 18 hs</p>
          <p>Sáb · 8 a 13 hs</p>
        </div>
        <div className="foot__col">
          <h5>Compra</h5>
          <p>Pago: efectivo contra entrega</p>
          <p>Envío gratis desde $30.000</p>
          <p>Pedido mín. mayorista: $30.000</p>
        </div>
      </div>
      <div className="foot__bot">
        <span>© 2026 · Caccia · Bernhard</span>
        <span>v1.0 · Hecho en Córdoba</span>
      </div>
    </footer>
  )
}
