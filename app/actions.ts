'use server'

import { supabase } from '@/lib/supabase'

export interface CrearPedidoInput {
  tipo: 'consumidor' | 'mayorista'
  nombre: string
  cuit: string
  razon: string
  telefono: string
  direccion: string
  localidad: string
  notas: string
  items: { producto_id: string; cantidad: number }[]
}

export async function crearPedidoWeb(input: CrearPedidoInput) {
  const { data, error } = await (supabase as any).rpc('crear_pedido_web', {
    p_tipo_cliente: input.tipo,
    p_nombre: input.nombre,
    p_cuit: input.cuit || null,
    p_razon_social: input.razon || null,
    p_telefono: input.telefono,
    p_direccion: input.direccion,
    p_localidad: input.localidad,
    p_notas: input.notas || null,
    p_items: input.items,
  })

  if (error) {
    return { ok: false as const, error: error.message }
  }
  return { ok: true as const, numero: data.numero_pedido as number, id: data.id as string }
}
