-- ============================================================
-- Setup para conectar la web pública (web-distribuidora) a la
-- misma base de datos de distribuidora-app.
-- Correr todo este script una sola vez en Supabase → SQL Editor.
-- ============================================================

-- 1) Columna para fotos de producto (opcional, podés cargarla después)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url text;

-- 2) Vista pública de productos: solo columnas seguras para mostrar
--    a desconocidos (NO incluye costo ni margen).
CREATE OR REPLACE VIEW productos_publicos AS
SELECT id, nombre, marca, proveedor, categoria, presentacion, unidad_medida,
       precio_venta, stock_actual, imagen_url
FROM productos
WHERE activo = true;

GRANT SELECT ON productos_publicos TO anon, authenticated;

-- 3) Permitir pedidos sin un vendedor interno asignado (pedidos web)
ALTER TABLE pedidos ALTER COLUMN vendedor_id DROP NOT NULL;
ALTER TABLE pedidos ALTER COLUMN creado_por DROP NOT NULL;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'interno';

-- 4) Función que crea el pedido desde la web (RPC, ejecuta con permisos
--    elevados para poder insertar en clientes/pedidos/items_pedido aunque
--    quien llama sea un visitante anónimo). Valida y recalcula todo en el
--    servidor: nunca confía en precios que vengan del navegador.
CREATE OR REPLACE FUNCTION crear_pedido_web(
  p_tipo_cliente text,
  p_nombre text,
  p_cuit text,
  p_razon_social text,
  p_telefono text,
  p_direccion text,
  p_localidad text,
  p_notas text,
  p_items jsonb -- [{ "producto_id": "uuid", "cantidad": 2 }, ...]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
  v_pedido_id uuid;
  v_numero_pedido int;
  v_subtotal numeric := 0;
  v_costo numeric := 0;
  v_item jsonb;
  v_prod productos%ROWTYPE;
  v_cant int;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido no tiene productos';
  END IF;

  -- Buscar cliente existente por teléfono, o crear uno nuevo
  SELECT id INTO v_cliente_id
  FROM clientes
  WHERE telefono = p_telefono
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (nombre_comercio, razon_social, telefono, direccion, localidad, tipo_cliente, activo)
    VALUES (
      COALESCE(NULLIF(p_razon_social, ''), p_nombre),
      NULLIF(p_razon_social, ''),
      p_telefono, p_direccion, p_localidad, p_tipo_cliente, true
    )
    RETURNING id INTO v_cliente_id;
  ELSE
    UPDATE clientes
    SET nombre_comercio = COALESCE(NULLIF(p_razon_social, ''), p_nombre),
        direccion = p_direccion,
        localidad = p_localidad,
        tipo_cliente = p_tipo_cliente
    WHERE id = v_cliente_id;
  END IF;

  -- Crear el pedido como "recibido" (pendiente de revisión), sin descontar stock
  INSERT INTO pedidos (
    cliente_id, vendedor_id, fecha_pedido, estado,
    subtotal, total_costo, total_final,
    observaciones, metodo_pago, creado_por, stock_descontado, origen
  )
  VALUES (
    v_cliente_id, NULL, CURRENT_DATE, 'recibido',
    0, 0, 0,
    NULLIF(p_notas, ''), 'efectivo', NULL, false, 'web'
  )
  RETURNING id, numero_pedido INTO v_pedido_id, v_numero_pedido;

  -- Insertar los items, recalculando precios reales del producto (no confiar en el cliente)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_prod FROM productos WHERE id = (v_item->>'producto_id')::uuid AND activo = true;
    IF v_prod.id IS NULL THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'producto_id';
    END IF;

    v_cant := COALESCE((v_item->>'cantidad')::int, 0);
    IF v_cant <= 0 THEN CONTINUE; END IF;

    INSERT INTO items_pedido (pedido_id, producto_id, cantidad, costo_unitario, precio_unitario, subtotal_linea, sin_cargo)
    VALUES (v_pedido_id, v_prod.id, v_cant, v_prod.costo, v_prod.precio_venta, v_prod.precio_venta * v_cant, false);

    v_subtotal := v_subtotal + v_prod.precio_venta * v_cant;
    v_costo := v_costo + v_prod.costo * v_cant;
  END LOOP;

  -- Envío: gratis desde $30.000, sino $2.500
  UPDATE pedidos
  SET subtotal = v_subtotal,
      total_costo = v_costo,
      total_final = v_subtotal + CASE WHEN v_subtotal >= 30000 OR v_subtotal = 0 THEN 0 ELSE 2500 END
  WHERE id = v_pedido_id;

  RETURN jsonb_build_object('id', v_pedido_id, 'numero_pedido', v_numero_pedido);
END;
$$;

GRANT EXECUTE ON FUNCTION crear_pedido_web(text, text, text, text, text, text, text, text, jsonb) TO anon, authenticated;

-- 5) Permitir que el panel interno (distribuidora-app) inserte pedidos
--    de logística sin tocar nada más: no se necesita ningún cambio ahí,
--    el RPC ya hace todo el trabajo de forma atómica y segura.
