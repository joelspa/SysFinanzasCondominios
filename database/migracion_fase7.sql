-- database/migracion_fase7.sql
-- Fase 7: recibos fijos. Número correlativo por condominio en pagos y gastos, quién pagó,
-- referencia bancaria, quién y cuándo registró y anuló, y CI/NIT de las personas.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 6:
--   npm run migrar -- database/migracion_fase7.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

-- 1) Documento de identidad de las personas (sale en los recibos)
ALTER TABLE persona ADD COLUMN documento VARCHAR(20);   -- CI o NIT

-- Las vistas usan i.* y no ven columnas nuevas: se eliminan y se vuelven a crear al final
DROP VIEW v_departamento;
DROP VIEW v_ingreso;

-- 2) Recibos de pago
ALTER TABLE ingreso ADD COLUMN numero            INT;                               -- número de recibo, correlativo por condominio
ALTER TABLE ingreso ADD COLUMN pagador           VARCHAR(120);                      -- «Recibí de» (puede ser el inquilino)
ALTER TABLE ingreso ADD COLUMN pagador_documento VARCHAR(20);                       -- CI o NIT de quien pagó
ALTER TABLE ingreso ADD COLUMN referencia        VARCHAR(60);                       -- número de la transferencia o del QR
ALTER TABLE ingreso ADD COLUMN fecha_registro    TIMESTAMP NOT NULL DEFAULT now();  -- cuándo se cargó al sistema
ALTER TABLE ingreso ADD COLUMN anulado_por       INT REFERENCES usuario(id_usuario);
ALTER TABLE ingreso ADD COLUMN fecha_anulacion   TIMESTAMP;

-- Los pagos que ya existían se numeran en el orden en que se registraron, dentro de cada condominio
UPDATE ingreso i SET numero = n.numero, fecha_registro = i.fecha
FROM (SELECT id_ingreso, ROW_NUMBER() OVER (PARTITION BY id_condominio ORDER BY id_ingreso) AS numero FROM ingreso) n
WHERE n.id_ingreso = i.id_ingreso;

ALTER TABLE ingreso ALTER COLUMN numero SET NOT NULL;
ALTER TABLE ingreso ADD UNIQUE (id_condominio, numero);

-- 3) Comprobantes de gasto
ALTER TABLE egreso ADD COLUMN numero          INT;
ALTER TABLE egreso ADD COLUMN fecha_registro  TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE egreso ADD COLUMN anulado_por     INT REFERENCES usuario(id_usuario);
ALTER TABLE egreso ADD COLUMN fecha_anulacion TIMESTAMP;

UPDATE egreso e SET numero = n.numero, fecha_registro = e.fecha
FROM (SELECT id_egreso, ROW_NUMBER() OVER (PARTITION BY id_condominio ORDER BY id_egreso) AS numero FROM egreso) n
WHERE n.id_egreso = e.id_egreso;

ALTER TABLE egreso ALTER COLUMN numero SET NOT NULL;
ALTER TABLE egreso ADD UNIQUE (id_condominio, numero);

-- 4) Vistas (iguales que antes; ahora incluyen las columnas nuevas de ingreso)
CREATE VIEW v_ingreso AS
SELECT i.*,
       COALESCE(a.aplicado, 0) AS aplicado,
       CASE WHEN i.estado = 'registrado' AND i.aplica_deuda THEN i.monto - COALESCE(a.aplicado, 0) ELSE 0 END AS a_favor
FROM ingreso i
LEFT JOIN (SELECT id_ingreso, SUM(monto) AS aplicado FROM ingreso_cargo GROUP BY id_ingreso) a ON a.id_ingreso = i.id_ingreso;

CREATE VIEW v_departamento AS
SELECT d.*,
       t.nombre AS tipo_departamento,
       t.cuota_mensual,
       prop.id_persona AS id_propietario,
       prop.nombre AS propietario,
       (SELECT COUNT(*) FROM residente r WHERE r.id_departamento = d.id_departamento AND r.estado = 'activo')::int AS residentes_activos,
       (SELECT COALESCE(SUM(c.saldo), 0) FROM v_cargo c WHERE c.id_departamento = d.id_departamento) AS deuda,
       (SELECT COALESCE(SUM(i.a_favor), 0) FROM v_ingreso i WHERE i.id_departamento = d.id_departamento) AS saldo_favor
FROM departamento d
JOIN tipo_departamento t ON t.id_tipo_departamento = d.id_tipo_departamento
LEFT JOIN LATERAL (
    SELECT r.id_persona, p.nombre
    FROM residente r
    JOIN persona p ON p.id_persona = r.id_persona
    WHERE r.id_departamento = d.id_departamento AND r.tipo_relacion = 'propietario' AND r.estado = 'activo'
    ORDER BY r.fecha_inicio DESC, r.id_residente DESC
    LIMIT 1
) prop ON TRUE;
