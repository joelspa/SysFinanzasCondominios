-- database/migracion_fase5.sql
-- Fase 5: inicio de sesión. Tabla de sesiones, usuario que registra cada traspaso y deuda pendiente
-- a nombre del propietario actual.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 4:
--   npm run migrar -- database/migracion_fase5.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)
-- Después asigne una contraseña al administrador:
--   npm run admin -- admin@condominio.com SuContraseña

SET search_path TO final;

-- 1) Sesiones abiertas. Se guardan en la base para que no se pierdan al reiniciar el servidor.
--    Los nombres de las columnas los define la librería connect-pg-simple.
CREATE TABLE sesion (
    sid    VARCHAR PRIMARY KEY,
    sess   JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_sesion_expire ON sesion (expire);

-- 2) Usuario que registró cada traspaso (queda vacío en los anteriores al inicio de sesión)
ALTER TABLE traspaso ADD COLUMN id_usuario INT REFERENCES usuario(id_usuario);

-- 3) La deuda es del departamento: los cargos pendientes de traspasos anteriores pasan a nombre
--    del propietario actual (los ya pagados conservan a quien era responsable)
UPDATE cargo c SET id_responsable = d.id_propietario
FROM v_departamento d
WHERE d.id_departamento = c.id_departamento
  AND d.id_propietario IS NOT NULL
  AND c.id_cargo IN (SELECT id_cargo FROM v_cargo WHERE saldo > 0);
