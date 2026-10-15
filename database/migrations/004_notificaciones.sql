-- ============================================================
-- 004_notificaciones.sql
-- Seguimiento y notificaciones (Sprint 5).
-- Añade `vista` a `notificacion`, un índice por `pedido_id` y
-- unicidad `(pedido_id, tipo)` para idempotencia de los avisos.
-- Idempotente: sólo aplica cada cambio si aún no existe.
-- ============================================================

SET NAMES utf8mb4;

-- 1) Columna `vista` (0 = no leída, 1 = leída por el cliente)
SET @existe_columna := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'notificacion'
     AND COLUMN_NAME = 'vista'
);
SET @sql := IF(
  @existe_columna = 0,
  'ALTER TABLE notificacion ADD COLUMN vista TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Índice por pedido
SET @existe_indice := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'notificacion'
     AND INDEX_NAME = 'idx_notificacion_pedido'
);
SET @sql := IF(
  @existe_indice = 0,
  'CREATE INDEX idx_notificacion_pedido ON notificacion(pedido_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Unicidad (pedido_id, tipo): evita avisos duplicados
SET @existe_unico := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'notificacion'
     AND INDEX_NAME = 'uq_notificacion_pedido_tipo'
);
SET @sql := IF(
  @existe_unico = 0,
  'ALTER TABLE notificacion ADD UNIQUE KEY uq_notificacion_pedido_tipo (pedido_id, tipo)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
