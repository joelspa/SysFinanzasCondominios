-- database/migracion_fase4.sql
-- Usuarios: se pueden desactivar en lugar de borrarlos (los que registraron pagos o gastos quedan en el historial).
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 3:
--   npm run migrar -- database/migracion_fase4.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

ALTER TABLE usuario ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;   -- false: no puede iniciar sesión
