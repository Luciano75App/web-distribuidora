-- Motor de "productos relacionados": para un producto dado, devuelve los
-- que más veces se compraron junto a él en el mismo pedido (excluyendo
-- pedidos cancelados/rechazados). Lo usan tanto la web pública (upsell
-- al cliente) como el panel interno (sugerencias al vendedor).
CREATE OR REPLACE FUNCTION productos_relacionados(p_producto_id uuid, p_limit int DEFAULT 6)
RETURNS TABLE (
  id uuid,
  nombre text,
  marca text,
  proveedor text,
  categoria text,
  presentacion text,
  unidad_medida text,
  precio_venta numeric,
  precio_consumidor_final numeric,
  stock_actual integer,
  imagen_url text,
  veces_juntos bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.nombre, p.marca, p.proveedor, p.categoria, p.presentacion,
         p.unidad_medida, p.precio_venta, p.precio_consumidor_final, p.stock_actual, p.imagen_url,
         COUNT(*) AS veces_juntos
  FROM items_pedido ip1
  JOIN pedidos pe ON pe.id = ip1.pedido_id AND pe.estado IN ('confirmado', 'preparado', 'entregado')
  JOIN items_pedido ip2 ON ip2.pedido_id = ip1.pedido_id AND ip2.producto_id <> ip1.producto_id
  JOIN productos p ON p.id = ip2.producto_id AND p.activo = true
  WHERE ip1.producto_id = p_producto_id
  GROUP BY p.id, p.nombre, p.marca, p.proveedor, p.categoria, p.presentacion,
           p.unidad_medida, p.precio_venta, p.precio_consumidor_final, p.stock_actual, p.imagen_url
  ORDER BY veces_juntos DESC, p.nombre
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION productos_relacionados(uuid, int) TO anon, authenticated;

-- Historial de compra por cliente: cantidad de pedidos (no cancelados) en
-- los que aparece cada producto. Lo usa el panel para "compra habitualmente".
CREATE OR REPLACE FUNCTION historial_cliente(p_cliente_id uuid)
RETURNS TABLE (
  producto_id uuid,
  veces_pedido bigint,
  unidades_totales bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ip.producto_id, COUNT(DISTINCT ip.pedido_id) AS veces_pedido, SUM(ip.cantidad) AS unidades_totales
  FROM items_pedido ip
  JOIN pedidos pe ON pe.id = ip.pedido_id AND pe.estado IN ('confirmado', 'preparado', 'entregado')
  WHERE pe.cliente_id = p_cliente_id
  GROUP BY ip.producto_id
  ORDER BY veces_pedido DESC, unidades_totales DESC;
$$;

GRANT EXECUTE ON FUNCTION historial_cliente(uuid) TO authenticated;
