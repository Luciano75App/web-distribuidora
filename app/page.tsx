import { supabase } from '@/lib/supabase'
import { Storefront } from '@/components/Storefront'
import type { Producto } from '@/lib/types'

export const revalidate = 60

export default async function Home() {
  const { data: products } = await supabase
    .from('productos_publicos')
    .select('id, nombre, marca, proveedor, categoria, presentacion, unidad_medida, precio_venta, stock_actual, imagen_url')
    .order('nombre')

  return <Storefront products={(products ?? []) as Producto[]} />
}
