-- database/migracion_fase1.sql
-- Fase 1: pagos parciales y adelantados, saldo a favor, responsable de cada cargo y traspasos de propiedad.
-- Se ejecuta UNA sola vez sobre una base creada con la versión anterior de schema.sql:
--   npm run migrar -- database/migracion_fase1.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

-- 1) Aplicación de pagos: un pago puede cubrir varios cargos y un cargo puede pagarse en varias partes
CREATE TABLE ingreso_cargo (
    id_ingreso_cargo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ingreso       INT NOT NULL REFERENCES ingreso(id_ingreso) ON DELETE CASCADE,
    id_cargo         INT NOT NULL REFERENCES cargo(id_cargo),
    monto            DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    UNIQUE (id_ingreso, id_cargo)
);

-- aplica_deuda = false: ingreso que no paga deudas (ej. alquiler del salón de eventos)
ALTER TABLE ingreso ADD COLUMN aplica_deuda BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE ingreso ADD COLUMN motivo_anulacion VARCHAR(200);

-- Los pagos que antes cancelaban un cargo pasan a la tabla nueva; los que no tenían cargo eran extraordinarios
INSERT INTO ingreso_cargo (id_ingreso, id_cargo, monto)
SELECT i.id_ingreso, i.id_cargo, LEAST(i.monto, c.monto)
FROM ingreso i
JOIN cargo c ON c.id_cargo = i.id_cargo
WHERE i.estado = 'registrado';

UPDATE ingreso SET aplica_deuda = (id_cargo IS NOT NULL);

ALTER TABLE ingreso DROP COLUMN id_cargo;                              -- también elimina su FK compuesta
ALTER TABLE cargo DROP CONSTRAINT cargo_id_cargo_id_departamento_key;  -- solo existía para esa FK

-- 2) Responsable de cada cargo: el propietario del departamento cuando se emitió (queda como historial)
ALTER TABLE cargo ADD COLUMN id_responsable INT REFERENCES persona(id_persona);

-- 3) El estado del cargo ya no se guarda: se calcula en v_cargo según lo pagado y el vencimiento
ALTER TABLE cargo DROP COLUMN estado;

-- 4) Historial de traspasos de propiedad
CREATE TABLE traspaso (
    id_traspaso             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento         INT NOT NULL REFERENCES departamento(id_departamento),
    id_propietario_anterior INT REFERENCES persona(id_persona),       -- NULL si no tenía propietario
    id_propietario_nuevo    INT NOT NULL REFERENCES persona(id_persona),
    fecha                   DATE NOT NULL DEFAULT CURRENT_DATE,
    deuda_pendiente         DECIMAL(18,2) NOT NULL DEFAULT 0,        -- deuda del departamento al momento del traspaso
    observacion             VARCHAR(250),
    CHECK (id_propietario_anterior IS NULL OR id_propietario_anterior <> id_propietario_nuevo)
);

-- 5) Vistas con los saldos calculados
CREATE VIEW v_cargo AS
SELECT c.*,
       COALESCE(a.pagado, 0) AS pagado,
       c.monto - COALESCE(a.pagado, 0) AS saldo,
       CASE WHEN c.monto - COALESCE(a.pagado, 0) <= 0 THEN 'pagado'
            WHEN c.vencimiento < CURRENT_DATE THEN 'vencido'
            WHEN COALESCE(a.pagado, 0) > 0 THEN 'parcial'
            ELSE 'pendiente' END AS estado
FROM cargo c
LEFT JOIN (SELECT id_cargo, SUM(monto) AS pagado FROM ingreso_cargo GROUP BY id_cargo) a ON a.id_cargo = c.id_cargo;

-- a_favor: parte del pago que no se aplicó a ningún cargo (saldo a favor del departamento)
CREATE VIEW v_ingreso AS
SELECT i.*,
       COALESCE(a.aplicado, 0) AS aplicado,
       CASE WHEN i.estado = 'registrado' AND i.aplica_deuda THEN i.monto - COALESCE(a.aplicado, 0) ELSE 0 END AS a_favor
FROM ingreso i
LEFT JOIN (SELECT id_ingreso, SUM(monto) AS aplicado FROM ingreso_cargo GROUP BY id_ingreso) a ON a.id_ingreso = i.id_ingreso;

-- Departamento con su tipo, propietario actual, ocupación, deuda y saldo a favor
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

-- Los cargos que ya existían quedan a nombre del propietario actual
UPDATE cargo c SET id_responsable = d.id_propietario
FROM v_departamento d
WHERE d.id_departamento = c.id_departamento;
