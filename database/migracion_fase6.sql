-- database/migracion_fase6.sql
-- Fase 6: varios condominios. Tipos de departamento por condominio, condominios de cada tesorero
-- e ingresos del condominio que no vienen de un departamento.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 5:
--   npm run migrar -- database/migracion_fase6.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

-- 1) Cada condominio define sus tipos de departamento y sus cuotas.
--    Los tipos que ya existían quedan en el primer condominio.
ALTER TABLE tipo_departamento ADD COLUMN id_condominio INT REFERENCES condominio(id_condominio);
UPDATE tipo_departamento SET id_condominio = (SELECT MIN(id_condominio) FROM condominio);
ALTER TABLE tipo_departamento ALTER COLUMN id_condominio SET NOT NULL;
ALTER TABLE tipo_departamento DROP CONSTRAINT tipo_departamento_nombre_key;
ALTER TABLE tipo_departamento ADD UNIQUE (id_condominio, nombre);   -- el nombre se puede repetir en otro condominio

-- 2) Condominios que puede ver cada tesorero (el administrador ve todos y no necesita filas aquí).
--    Los tesoreros que ya existían conservan el acceso a los condominios actuales.
CREATE TABLE usuario_condominio (
    id_usuario    INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_condominio INT NOT NULL REFERENCES condominio(id_condominio) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_condominio)
);

INSERT INTO usuario_condominio (id_usuario, id_condominio)
SELECT u.id_usuario, c.id_condominio FROM usuario u CROSS JOIN condominio c WHERE u.rol = 'tesorero';

-- 3) Ingresos del condominio sin departamento (alquiler del salón a un tercero, intereses del banco).
--    El ingreso guarda su condominio y el departamento pasa a ser opcional.
--    Las vistas usan i.* y no ven columnas nuevas: se eliminan y se vuelven a crear.
DROP VIEW v_departamento;
DROP VIEW v_ingreso;

ALTER TABLE ingreso ADD COLUMN id_condominio INT REFERENCES condominio(id_condominio);
UPDATE ingreso i SET id_condominio = d.id_condominio FROM departamento d WHERE d.id_departamento = i.id_departamento;
ALTER TABLE ingreso ALTER COLUMN id_condominio SET NOT NULL;
ALTER TABLE ingreso ALTER COLUMN id_departamento DROP NOT NULL;
-- Sin departamento no hay deuda a la que aplicarlo
ALTER TABLE ingreso ADD CONSTRAINT ingreso_sin_departamento_check CHECK (id_departamento IS NOT NULL OR aplica_deuda = FALSE);

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
