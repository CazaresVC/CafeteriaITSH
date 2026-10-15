-- ============================================================
-- 003_seed_usuarios.sql
-- Cuentas operativas iniciales SOLO PARA DESARROLLO/DEMO.
-- Ejecutar DESPUÉS de 001_crear_esquema.sql y 002_seed_inicial.sql
--
-- Credenciales de desarrollo (NUNCA usar en producción):
--   administrador : admin@cafeitsh.local    / Admin1234
--   cajero        : cajero@cafeitsh.local   / Cajero1234
--   cocinero      : cocinero@cafeitsh.local / Cocinero1234
--
-- Las contraseñas se almacenan únicamente como hash bcrypt (coste 10);
-- no se guarda ninguna contraseña en texto plano.
-- ============================================================

-- Forzar UTF-8 en la sesión para preservar acentos (ver 001).
SET NAMES utf8mb4;

INSERT IGNORE INTO usuario (nombre, correo, password_hash, rol_id)
SELECT 'Administrador', 'admin@cafeitsh.local',
       '$2a$10$PGKirS9l0iCUn49qQnJeuOjzWZBAYNokbhl60lisQRl8LnGG3WzMW',
       (SELECT id FROM rol WHERE nombre = 'administrador');

INSERT IGNORE INTO usuario (nombre, correo, password_hash, rol_id)
SELECT 'Cajero Mostrador', 'cajero@cafeitsh.local',
       '$2a$10$MNv1PP2kB1viLo5uCmGOseonSdqCaR8QTSBEq1CxOixc9Dcu9.kci',
       (SELECT id FROM rol WHERE nombre = 'cajero');

INSERT IGNORE INTO usuario (nombre, correo, password_hash, rol_id)
SELECT 'Cocinero', 'cocinero@cafeitsh.local',
       '$2a$10$pNSfiJ8lskVMBJMdZM.iuuJzGlC0veCObKi7CyFJiCqzY.TFUYTWq',
       (SELECT id FROM rol WHERE nombre = 'cocinero');
