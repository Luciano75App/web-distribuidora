'use client'

import { useEffect, useState } from 'react'
import { STORE, fmtARS, precioPara } from '@/lib/types'
import type { Producto, TipoCliente } from '@/lib/types'
import { crearPedidoWeb } from '@/app/actions'

const STEPS = [
  { key: 'datos',   label: 'Datos & entrega' },
  { key: 'confirm', label: 'Confirmar pedido' },
  { key: 'done',    label: 'Pedido enviado' },
]

interface Form {
  nombre: string
  cuit: string
  razon: string
  whatsapp: string
  domicilio: string
  localidad: string
  notas: string
}

const FORM_INICIAL: Form = {
  nombre: '', cuit: '', razon: '', whatsapp: '', domicilio: '', localidad: 'Córdoba', notas: '',
}

export function Checkout({
  open, onClose, cart, products, onClearCart, tipoCliente,
}: {
  open: boolean
  onClose: () => void
  cart: Record<string, number>
  products: Producto[]
  onClearCart: () => void
  tipoCliente: TipoCliente
}) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(FORM_INICIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [orderNumero, setOrderNumero] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const productMap = new Map(products.map(p => [p.id, p]))
  const items = Object.keys(cart)
    .map((id) => {
      const p = productMap.get(id)
      return p ? { ...p, qty: cart[id], precio: precioPara(p, tipoCliente) } : null
    })
    .filter((x): x is Producto & { qty: number; precio: number } => x !== null)

  const subtotal = items.reduce((a, it) => a + it.precio * it.qty, 0)
  const envio = subtotal >= STORE.envioGratisDesde || subtotal === 0 ? 0 : 2500
  const total = subtotal + envio
  const isMayorista = tipoCliente === 'mayorista'

  useEffect(() => {
    if (open) {
      setStep(0)
      setErrors({})
      setSendError('')
    }
  }, [open])

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function validateStep() {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.nombre.trim()) e.nombre = 'Requerido'
      if (!form.domicilio.trim()) e.domicilio = 'Requerido'
      const wa = form.whatsapp.replace(/\D/g, '')
      if (wa.length < 8) e.whatsapp = 'Mínimo 8 dígitos'
      if (isMayorista) {
        const c = form.cuit.replace(/\D/g, '')
        if (c.length !== 11) e.cuit = 'CUIT debe tener 11 dígitos'
        if (!form.razon.trim()) e.razon = 'Razón social requerida'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function next() {
    if (!validateStep()) return
    if (step === 1) {
      setSending(true)
      setSendError('')
      const res = await crearPedidoWeb({
        tipo: tipoCliente,
        nombre: form.nombre.trim(),
        cuit: form.cuit.trim(),
        razon: form.razon.trim(),
        telefono: form.whatsapp.trim(),
        direccion: form.domicilio.trim(),
        localidad: form.localidad.trim(),
        notas: form.notas.trim(),
        items: items.map((it) => ({ producto_id: it.id, cantidad: it.qty })),
      })
      setSending(false)
      if (!res.ok) { setSendError(res.error); return }
      setOrderNumero(res.numero)
      setStep(2)
      return
    }
    setStep((s) => s + 1)
  }
  function back() {
    if (step === 0) return
    setStep((s) => s - 1)
  }
  function finish() {
    onClearCart()
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && step !== 2) onClose() }}>
      <div className="modal">
        <header className="modal__head">
          <div className="modal__head-top">
            <h2 className="modal__title">{step === 2 ? '¡Pedido confirmado!' : 'Finalizar compra'}</h2>
            {step !== 2 && (
              <button className="modal__close" onClick={onClose} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
          <Stepper step={step} />
        </header>

        <div className="modal__body">
          {step === 0 && <StepDatos form={form} set={set} err={errors} isMayorista={isMayorista} />}
          {step === 1 && <StepConfirm form={form} items={items} subtotal={subtotal} envio={envio} total={total} isMayorista={isMayorista} />}
          {step === 2 && orderNumero !== null && <StepDone form={form} numero={orderNumero} total={total} items={items} />}
        </div>

        <footer className="modal__foot">
          {step === 2 ? (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '.1em' }}>
                #{orderNumero} · {fmtARS(total)}
              </div>
              <button className="btn" onClick={finish}>Volver al catálogo</button>
            </>
          ) : (
            <>
              <button className="btn ghost" onClick={back} disabled={step === 0} style={{ width: 'auto', padding: '12px 22px' }}>← Atrás</button>
              <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                {sendError && <div className="field__err">{sendError}</div>}
                <button className="btn" onClick={next} disabled={sending}>
                  {sending ? 'Enviando…' : step === 1 ? 'Enviar pedido' : 'Continuar'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => (
        <div key={s.key} style={{ display: 'contents' }}>
          <div className={'stepper__step ' + (i === step ? 'active' : i < step ? 'done' : '')}>
            <div className="stepper__num">{i < step ? '✓' : i + 1}</div>
            <span>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="stepper__bar" />}
        </div>
      ))}
    </div>
  )
}

function StepDatos({
  form, set, err, isMayorista,
}: { form: Form; set: (k: keyof Form, v: string) => void; err: Record<string, string>; isMayorista: boolean }) {
  return (
    <div>
      <p style={{ color: 'var(--ink-2)', marginTop: 0, marginBottom: 22, fontSize: 14 }}>
        Sólo te entregamos a domicilio. Te confirmamos el horario por WhatsApp.
      </p>

      {isMayorista && (
        <>
          <div className="field">
            <label className="field__label req">Razón social / Nombre fantasía</label>
            <input value={form.razon} onChange={(e) => set('razon', e.target.value)} placeholder="Almacén San Martín SRL" />
            {err.razon && <div className="field__err">{err.razon}</div>}
          </div>
          <div className="field">
            <label className="field__label req">CUIT</label>
            <input value={form.cuit} onChange={(e) => set('cuit', e.target.value)} placeholder="30-12345678-9" />
            <div className="field__hint">11 dígitos · usamos esto para tu factura A.</div>
            {err.cuit && <div className="field__err">{err.cuit}</div>}
          </div>
        </>
      )}

      <div className="field">
        <label className="field__label req">Nombre y apellido</label>
        <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Laura Pérez" />
        {err.nombre && <div className="field__err">{err.nombre}</div>}
      </div>

      <div className="field">
        <label className="field__label req">Domicilio de entrega</label>
        <input value={form.domicilio} onChange={(e) => set('domicilio', e.target.value)} placeholder="Av. Colón 1234, dpto 4B" />
        {err.domicilio && <div className="field__err">{err.domicilio}</div>}
      </div>

      <div className="field">
        <label className="field__label">Localidad</label>
        <input value={form.localidad} onChange={(e) => set('localidad', e.target.value)} />
      </div>

      <div className="field">
        <label className="field__label req">WhatsApp</label>
        <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="351 555 1234" />
        <div className="field__hint">Te confirmamos el pedido y el horario de reparto por este número.</div>
        {err.whatsapp && <div className="field__err">{err.whatsapp}</div>}
      </div>

      <div className="field">
        <label className="field__label">Notas para el repartidor (opcional)</label>
        <textarea rows={2} value={form.notas} onChange={(e) => set('notas', e.target.value)} placeholder="Tocar timbre 2, dejar con encargado…" />
      </div>
    </div>
  )
}

function StepConfirm({
  form, items, subtotal, envio, total, isMayorista,
}: { form: Form; items: (Producto & { qty: number; precio: number })[]; subtotal: number; envio: number; total: number; isMayorista: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
      <div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
          Resumen del pedido
        </p>
        <div className="summary">
          <div className="summary__sec">
            <h4>{isMayorista ? 'Comerciante' : 'Consumidor final'}</h4>
            <p>{form.nombre}</p>
            {isMayorista && <p style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{form.razon} · CUIT {form.cuit}</p>}
          </div>
          <div className="summary__sec">
            <h4>Entrega a</h4>
            <p>{form.domicilio}</p>
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>{form.localidad}</p>
          </div>
          <div className="summary__sec">
            <h4>WhatsApp</h4>
            <p style={{ fontFamily: 'var(--mono)' }}>{form.whatsapp}</p>
          </div>
          <div className="summary__sec">
            <h4>Productos ({items.length})</h4>
            <div className="summary__items">
              {items.map((it) => (
                <div key={it.id} className="summary__item">
                  <span>{it.qty}× {it.nombre}</span>
                  <span>{fmtARS(it.precio * it.qty)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="totals" style={{ borderTop: '1px dashed var(--line)', paddingTop: 14, marginBottom: 0 }}>
            <div className="totals__row"><span>Subtotal</span><span>{fmtARS(subtotal)}</span></div>
            <div className="totals__row muted"><span>Envío</span><span>{envio === 0 ? 'GRATIS' : fmtARS(envio)}</span></div>
            <div className="totals__row grand"><span>Total</span><strong>{fmtARS(total)}</strong></div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)', paddingTop: 6 }}>
            Pago: efectivo contra entrega.
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
          Qué pasa después
        </p>
        <div className="summary" style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>
            Tu pedido queda <strong style={{ color: 'var(--gold)' }}>pendiente de confirmación</strong>. Lo vamos a revisar y te
            contactamos por WhatsApp al <strong>{form.whatsapp || '(tu número)'}</strong> para coordinar el horario de entrega.
          </p>
        </div>
      </div>
    </div>
  )
}

function StepDone({
  form, numero, total, items,
}: { form: Form; numero: number; total: number; items: (Producto & { qty: number })[] }) {
  return (
    <div className="success-art">
      <div className="success-art__seal">✓</div>
      <h2 className="success-art__title">Pedido enviado</h2>
      <div className="success-art__code">#{numero}</div>
      <p style={{ color: 'var(--ink-2)', maxWidth: 420, margin: '20px auto 0', fontSize: 14, lineHeight: 1.6 }}>
        Te contactamos a tu WhatsApp <strong style={{ color: 'var(--gold)', fontFamily: 'var(--mono)' }}>{form.whatsapp}</strong> para
        confirmar tu pedido y coordinar el horario de entrega.
      </p>
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 14, justifyContent: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.1em' }}>
        <div><span style={{ color: 'var(--gold)' }}>{items.length}</span> ÍTEMS</div>
        <div>·</div>
        <div><span style={{ color: 'var(--gold)' }}>{fmtARS(total)}</span></div>
      </div>
    </div>
  )
}
