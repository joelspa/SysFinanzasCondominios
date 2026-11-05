-- database/migracion_fase2.sql
-- Fase 2: gastos (egresos) con proveedor, documento de respaldo y anulación con motivo.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 1:
--   npm run migrar -- database/migracion_fase2.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

ALTER TABLE egreso ADD COLUMN proveedor        VARCHAR(150);   -- a quién se le pagó
ALTER TABLE egreso ADD COLUMN numero_documento VARCHAR(50);    -- factura o recibo del proveedor
ALTER TABLE egreso ADD COLUMN observacion      VARCHAR(250);
ALTER TABLE egreso ADD COLUMN motivo_anulacion VARCHAR(200);
