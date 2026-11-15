-- database/migracion_fase8.sql
-- Fase 8: caja y banco. Movimientos de dinero entre la caja (efectivo) y el banco.
-- Se ejecuta UNA sola vez sobre una base que ya tiene la fase 7:
--   npm run migrar -- database/migracion_fase8.sql
-- (las instalaciones nuevas no la necesitan: schema.sql ya incluye estos cambios)

SET search_path TO final;

-- Depósitos (de la caja al banco) y retiros (del banco a la caja). No son ingresos ni gastos:
-- el dinero del condominio es el mismo, solo cambia de lugar. Sirven para que el saldo de la caja
-- y el del banco coincidan con la realidad. Igual que los recibos, no se editan: se anulan.
CREATE TABLE movimiento_caja (
    id_movimiento_caja INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_condominio      INT NOT NULL REFERENCES condominio(id_condominio),
    id_usuario         INT NOT NULL REFERENCES usuario(id_usuario),
    sentido            VARCHAR(15) NOT NULL CHECK (sentido IN ('caja_a_banco', 'banco_a_caja')),
    monto              DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    fecha              DATE NOT NULL DEFAULT CURRENT_DATE,
    observacion        VARCHAR(250),                  -- ej. número de la boleta de depósito
    estado             VARCHAR(15) NOT NULL DEFAULT 'registrado'
                       CHECK (estado IN ('registrado', 'anulado')),
    fecha_registro     TIMESTAMP NOT NULL DEFAULT now(),
    motivo_anulacion   VARCHAR(200),
    anulado_por        INT REFERENCES usuario(id_usuario),
    fecha_anulacion    TIMESTAMP
);
