import { supabase } from '@/lib/supabase'
import { Storefront } from '@/components/Storefront'
import type { Producto, Promo } from '@/lib/types'

export const revalidate = 60

export default async function Home() {
  const [{ data: products }, { data: promos }] = await Promise.all([
    supabase
      .from('productos_publicos')
      .select('id, nombre, marca, proveedor, categoria, presentacion, unidad_medida, precio_venta, stock_actual, imagen_url')
      .order('nombre'),
    supabase
      .from('cartelera_publica')
      .select('id, titulo, texto, imagen_url, producto_id, orden'),
  ])

  return <Storefront products={(products ?? []) as Producto[]} promos={(promos ?? []) as Promo[]} />
}
