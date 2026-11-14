-- database/migracion_fase3.sql
-- Fase 3: datos del condominio para los comprobantes y día de vencimiento de las expensas.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 2:
--   npm run migrar -- database/migracion_fase3.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

ALTER TABLE condominio ADD COLUMN nit             VARCHAR(30);
ALTER TABLE condominio ADD COLUMN telefono        VARCHAR(30);
ALTER TABLE condominio ADD COLUMN correo          VARCHAR(120);
ALTER TABLE condominio ADD COLUMN dia_vencimiento INT NOT NULL DEFAULT 10
    CHECK (dia_vencimiento BETWEEN 1 AND 28);   -- día del mes en que vencen las expensas
