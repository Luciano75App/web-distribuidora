export type TipoCliente = 'consumidor' | 'mayorista'

export interface Producto {
  id: string
  nombre: string
  marca: string | null
  proveedor: string
  categoria: string | null
  presentacion: string | null
  unidad_medida: string | null
  precio_venta: number
  precio_consumidor_final?: number | null
  stock_actual: number
  imagen_url?: string | null
}

// precio_venta = lo que ya se usa para comercios/mayoristas en toda la app.
// precio_consumidor_final = precio diferenciado para venta directa por la web.
export function precioPara(p: Producto, tipo: TipoCliente): number {
  if (tipo === 'consumidor' && p.precio_consumidor_final != null) return p.precio_consumidor_final
  return p.precio_venta
}

export interface Promo {
  id: string
  titulo: string
  texto: string | null
  imagen_url: string | null
  producto_id: string | null
  orden: number
}

export interface Categoria {
  id: string
  label: string
  accent: string
  icon: string
}

export const STORE = {
  name: 'Caccia · Bernhard',
  legal: 'Distribución Caccia Bernhard',
  address: 'Adolfo Bioy Casares 442 · Altos de La Calera, Córdoba',
  whatsapp: '3512053916',
  whatsappFmt: '+54 9 351 205-3916',
  minMayorista: 30000,
  envioGratisDesde: 30000,
}

export const CATEGORIAS_BASE: Categoria[] = [
  { id: 'all', label: 'Todo', accent: '#e8c468', icon: '✦' },
  { id: 'mani', label: 'Maní y frutos secos', accent: '#d39446', icon: '◉' },
  { id: 'pan', label: 'Pan', accent: '#c79a4e', icon: '◍' },
  { id: 'pastas', label: 'Pastas frescas', accent: '#e6a23c', icon: '≋' },
  { id: 'tortillas', label: 'Tortillas', accent: '#c97b3a', icon: '◐' },
  { id: 'galletitas', label: 'Galletitas', accent: '#e0a93b', icon: '◇' },
  { id: 'alfajores', label: 'Alfajores', accent: '#a86b3f', icon: '◎' },
  { id: 'tostadas', label: 'Tostadas', accent: '#caa15e', icon: '▱' },
  { id: 'grisines', label: 'Grisines & snacks', accent: '#d8a85a', icon: '▮' },
  { id: 'tortas', label: 'Tortas y budines', accent: '#c66b6b', icon: '✿' },
  { id: 'dulces', label: 'Pan dulce & festivos', accent: '#d98a5a', icon: '✺' },
  { id: 'almacen', label: 'Almacén & repostería', accent: '#8aa6bd', icon: '✜' },
  { id: 'otros', label: 'Otros', accent: '#94a3b8', icon: '•' },
]

export const fmtARS = (n: number) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 })
