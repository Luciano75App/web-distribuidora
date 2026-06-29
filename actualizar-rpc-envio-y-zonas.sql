-- Reglas de envío actualizadas:
--   Comercio (mayorista): nunca paga envío (ya tiene mínimo de $30.000)
--   Consumidor final: $3.000 si no llega a $30.000, gratis si lo supera
-- Y se agrega Argüello a las zonas de cobertura.
CREATE OR REPLACE FUNCTION crear_pedido_web(
  p_tipo_cliente text,
  p_nombre text,
  p_cuit text,
  p_razon_social text,
  p_telefono text,
  p_direccion text,
  p_localidad text,
  p_notas text,
  p_items jsonb,
  p_vendedor_id uuid DEFAULT NULL
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
  v_precio numeric;
  v_vendedor_valido uuid;
  v_zonas text[] := ARRAY[
    'La Calera', 'Saldán', 'Villa Allende', 'Mendiolaza', 'Unquillo', 'Argüello (Córdoba)',
    'Barrio Don Bosco (Córdoba)', 'Barrio Chateau (Córdoba)',
    'Barrio Quebrada de las Rosas (Córdoba)', 'Torre Gama (Córdoba)',
    'Torre Sol (Córdoba)', 'Av. Don Bosco (Córdoba)'
  ];
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido no tiene productos';
  END IF;

  IF NOT (p_localidad = ANY(v_zonas)) THEN
    RAISE EXCEPTION 'Zona fuera de cobertura: %', p_localidad;
  END IF;

  IF p_vendedor_id IS NOT NULL THEN
    SELECT id INTO v_vendedor_valido FROM usuarios WHERE id = p_vendedor_id AND activo = true;
  END IF;

  SELECT id INTO v_cliente_id
  FROM clientes
  WHERE telefono = p_telefono
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (nombre_comercio, razon_social, telefono, direccion, localidad, tipo_cliente, activo, vendedor_asignado_id)
    VALUES (
      COALESCE(NULLIF(p_razon_social, ''), p_nombre),
      NULLIF(p_razon_social, ''),
      p_telefono, p_direccion, p_localidad, p_tipo_cliente, true, v_vendedor_valido
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

  INSERT INTO pedidos (
    cliente_id, vendedor_id, fecha_pedido, estado,
    subtotal, total_costo, total_final,
    observaciones, metodo_pago, creado_por, stock_descontado, origen
  )
  VALUES (
    v_cliente_id, v_vendedor_valido, CURRENT_DATE, 'recibido',
    0, 0, 0,
    NULLIF(p_notas, ''), 'efectivo', v_vendedor_valido, false, 'web'
  )
  RETURNING id, numero_pedido INTO v_pedido_id, v_numero_pedido;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_prod FROM productos WHERE id = (v_item->>'producto_id')::uuid AND activo = true;
    IF v_prod.id IS NULL THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'producto_id';
    END IF;

    v_cant := COALESCE((v_item->>'cantidad')::int, 0);
    IF v_cant <= 0 THEN CONTINUE; END IF;

    v_precio := CASE
      WHEN p_tipo_cliente = 'consumidor' AND v_prod.precio_consumidor_final IS NOT NULL THEN v_prod.precio_consumidor_final
      ELSE v_prod.precio_venta
    END;

    INSERT INTO items_pedido (pedido_id, producto_id, cantidad, costo_unitario, precio_unitario, subtotal_linea, sin_cargo)
    VALUES (v_pedido_id, v_prod.id, v_cant, v_prod.costo, v_precio, v_precio * v_cant, false);

    v_subtotal := v_subtotal + v_precio * v_cant;
    v_costo := v_costo + v_prod.costo * v_cant;
  END LOOP;

  -- Envío: comercio nunca paga; consumidor paga $3.000 si no llega a $30.000
  UPDATE pedidos
  SET subtotal = v_subtotal,
      total_costo = v_costo,
      total_final = v_subtotal + CASE
        WHEN v_subtotal <= 0 THEN 0
        WHEN p_tipo_cliente = 'mayorista' THEN 0
        WHEN v_subtotal >= 30000 THEN 0
        ELSE 3000
      END
  WHERE id = v_pedido_id;

  RETURN jsonb_build_object('id', v_pedido_id, 'numero_pedido', v_numero_pedido);
END;
$$;

GRANT EXECUTE ON FUNCTION crear_pedido_web(text, text, text, text, text, text, text, text, jsonb, uuid) TO anon, authenticated;
