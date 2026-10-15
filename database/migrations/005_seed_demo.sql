-- ============================================================
-- 005_seed_demo.sql
-- Datos de demostración SOLO PARA DESARROLLO del flujo completo
-- (Sprint 5). Crea un cliente demo con pedidos en distintos
-- estados y una notificación de "pedido listo".
--
-- Credenciales de desarrollo (NUNCA usar en producción):
--   cliente : cliente@cafeitsh.local / Cliente1234
--
-- Idempotente: usa INSERT IGNORE y guardas de existencia.
-- ============================================================

SET NAMES utf8mb4;

-- Cliente demo (hash bcrypt de 'Cliente1234', coste 10)
INSERT IGNORE INTO usuario (nombre, correo, password_hash, rol_id)
SELECT 'Cliente Demo', 'cliente@cafeitsh.local',
       '$2a$10$anoO3zWLPn1AIfhaJgHxDeTaQBo5XFUcaJG6.V875.8s6h0jTS6pe',
       (SELECT id FROM rol WHERE nombre = 'usuario');

SET @cliente_id := (SELECT id FROM usuario WHERE correo = 'cliente@cafeitsh.local');
SET @menu_gordita := (
  SELECT m.id FROM menu_dia m JOIN platillo p ON p.id = m.platillo_id
   WHERE m.fecha = CURDATE() AND p.nombre = 'Gordita de frijol' LIMIT 1
);
SET @menu_cafe := (
  SELECT m.id FROM menu_dia m JOIN platillo p ON p.id = m.platillo_id
   WHERE m.fecha = CURDATE() AND p.nombre = 'Café de olla' LIMIT 1
);
SET @estado_listo := (SELECT id FROM estado_pedido WHERE nombre = 'Listo');
SET @estado_entregado := (SELECT id FROM estado_pedido WHERE nombre = 'Entregado');

-- Pedido 1: Listo (con notificación de pedido listo)
INSERT IGNORE INTO pedido
  (numero, tipo, estado_id, usuario_id, fecha_recoleccion, total, creado_por)
SELECT 'ITS-DEMO-0001', 'anticipado', @estado_listo, @cliente_id, NOW(), 60.00, @cliente_id
 WHERE @cliente_id IS NOT NULL AND @estado_listo IS NOT NULL;

INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
SELECT p.id, @menu_gordita, 2, 30.00, 60.00
  FROM pedido p
 WHERE p.numero = 'ITS-DEMO-0001' AND @menu_gordita IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM pedido_detalle d WHERE d.pedido_id = p.id);

INSERT IGNORE INTO notificacion (pedido_id, tipo, canal, estado_envio, vista)
SELECT id, 'pedido_listo', 'push', 'enviada', 0
  FROM pedido WHERE numero = 'ITS-DEMO-0001';

-- Pedido 2: Entregado (pagado en línea)
INSERT IGNORE INTO pedido
  (numero, tipo, estado_id, usuario_id, fecha_recoleccion, total, creado_por)
SELECT 'ITS-DEMO-0002', 'anticipado', @estado_entregado, @cliente_id, NOW(), 45.00, @cliente_id
 WHERE @cliente_id IS NOT NULL AND @estado_entregado IS NOT NULL;

INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
SELECT p.id, @menu_gordita, 1, 30.00, 30.00
  FROM pedido p
 WHERE p.numero = 'ITS-DEMO-0002' AND @menu_gordita IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM pedido_detalle d WHERE d.pedido_id = p.id);

INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
SELECT p.id, @menu_cafe, 1, 15.00, 15.00
  FROM pedido p
 WHERE p.numero = 'ITS-DEMO-0002' AND @menu_cafe IS NOT NULL
   AND (SELECT COUNT(*) FROM pedido_detalle d WHERE d.pedido_id = p.id) = 1;

INSERT IGNORE INTO pago (pedido_id, metodo, monto, referencia, registrado_por)
SELECT id, 'online', total, 'SIM-DEMO', @cliente_id
  FROM pedido WHERE numero = 'ITS-DEMO-0002';
