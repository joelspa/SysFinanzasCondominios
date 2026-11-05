-- database/schema.sql
-- Sistema de Gestión de Finanzas para Condominios (un solo condominio)
-- Ejecutar en la base de datos desaweb2: todas las tablas se crean en el esquema final

CREATE SCHEMA IF NOT EXISTS final;
SET search_path TO final;

CREATE TABLE condominio (
    id_condominio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    direccion       VARCHAR(200) NOT NULL,
    nit             VARCHAR(30),
    telefono        VARCHAR(30),
    correo          VARCHAR(120),
    dia_vencimiento INT NOT NULL DEFAULT 10
                    CHECK (dia_vencimiento BETWEEN 1 AND 28)   -- día del mes en que vencen las expensas
);

CREATE TABLE tipo_departamento (
    id_tipo_departamento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               VARCHAR(60) NOT NULL UNIQUE,
    descripcion          VARCHAR(200),
    cuota_mensual        DECIMAL(18,2) NOT NULL CHECK (cuota_mensual >= 0)
);

CREATE TABLE departamento (
    id_departamento      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_condominio        INT NOT NULL REFERENCES condominio(id_condominio),
    numero               VARCHAR(15) NOT NULL,
    piso                 INT NOT NULL,
    estado               VARCHAR(15) NOT NULL DEFAULT 'activo'
                         CHECK (estado IN ('activo', 'inactivo')),
    id_tipo_departamento INT NOT NULL REFERENCES tipo_departamento(id_tipo_departamento),
    metros_cuadrados     DECIMAL(8,2) NOT NULL CHECK (metros_cuadrados > 0),
    UNIQUE (id_condominio, numero)
);

CREATE TABLE persona (
    id_persona INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(120) NOT NULL,
    telefono   VARCHAR(25),
    correo     VARCHAR(120)
);

-- Residentes: tabla intermedia que resuelve la relación N:M entre departamento y persona
-- (propietarios, inquilinos, etc. de cada departamento)
CREATE TABLE residente (
    id_residente    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento INT NOT NULL REFERENCES departamento(id_departamento),
    id_persona      INT NOT NULL REFERENCES persona(id_persona),
    tipo_relacion   VARCHAR(50) NOT NULL,          -- propietario, inquilino, etc.
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE,
    estado          VARCHAR(15) NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'inactivo')),
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE tipo_ingreso (
    id_tipo_ingreso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     VARCHAR(200)
);

CREATE TABLE usuario (
    id_usuario    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    correo        VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(30) NOT NULL DEFAULT 'admin'
                  CHECK (rol IN ('admin', 'tesorero')),
    activo        BOOLEAN NOT NULL DEFAULT TRUE   -- false: no puede iniciar sesión
);

-- Cargos: lo que debe cada departamento (expensas, multas, cuotas extraordinarias).
-- El estado (pendiente, parcial, pagado, vencido) no se guarda: se calcula en v_cargo.
CREATE TABLE cargo (
    id_cargo        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento INT NOT NULL REFERENCES departamento(id_departamento),
    id_responsable  INT REFERENCES persona(id_persona),   -- propietario cuando se emitió el cargo (historial)
    concepto        VARCHAR(180) NOT NULL,
    periodo         DATE NOT NULL,                 -- poner el día 1 del mes (ej. 2026-10-01)
    monto           DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    vencimiento     DATE NOT NULL,
    UNIQUE (id_departamento, periodo, concepto)    -- evita cargos duplicados
);

-- Ingresos: el dinero que entra. Si aplica_deuda, se reparte entre los cargos del departamento
-- (del más antiguo al más nuevo) y lo que sobra queda como saldo a favor.
CREATE TABLE ingreso (
    id_ingreso       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento  INT NOT NULL REFERENCES departamento(id_departamento),
    id_tipo_ingreso  INT NOT NULL REFERENCES tipo_ingreso(id_tipo_ingreso),
    id_usuario       INT NOT NULL REFERENCES usuario(id_usuario),
    concepto         VARCHAR(180) NOT NULL,
    monto            DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    fecha            DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago      VARCHAR(50) NOT NULL,
    estado           VARCHAR(15) NOT NULL DEFAULT 'registrado'
                     CHECK (estado IN ('registrado', 'anulado')),
    aplica_deuda     BOOLEAN NOT NULL DEFAULT TRUE,   -- false: no paga deudas (ej. alquiler del salón)
    motivo_anulacion VARCHAR(200)
);

-- Aplicación de pagos: un pago puede cubrir varios cargos y un cargo puede pagarse en varias partes
CREATE TABLE ingreso_cargo (
    id_ingreso_cargo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ingreso       INT NOT NULL REFERENCES ingreso(id_ingreso) ON DELETE CASCADE,
    id_cargo         INT NOT NULL REFERENCES cargo(id_cargo),
    monto            DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    UNIQUE (id_ingreso, id_cargo)
);

-- Historial de traspasos de propiedad
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

CREATE TABLE tipo_egreso (
    id_tipo_egreso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(200)
);

CREATE TABLE egreso (
    id_egreso      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_condominio  INT NOT NULL REFERENCES condominio(id_condominio),
    id_usuario     INT NOT NULL REFERENCES usuario(id_usuario),
    concepto       VARCHAR(180) NOT NULL,
    monto          DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
    estado         VARCHAR(15) NOT NULL DEFAULT 'registrado'
                   CHECK (estado IN ('registrado', 'anulado')),
    id_tipo_egreso INT NOT NULL REFERENCES tipo_egreso(id_tipo_egreso),
    metodo_pago    VARCHAR(50) NOT NULL DEFAULT 'efectivo',
    proveedor        VARCHAR(150),                 -- a quién se le pagó
    numero_documento VARCHAR(50),                  -- factura o recibo del proveedor
    observacion      VARCHAR(250),
    motivo_anulacion VARCHAR(200)
);

-- Vistas con los saldos calculados
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

-- Datos iniciales
INSERT INTO condominio (nombre, direccion)
VALUES ('Mi Condominio', 'Santa Cruz de la Sierra');   -- cambiar por el real

INSERT INTO tipo_ingreso (nombre, descripcion) VALUES
    ('Expensas', 'Pago mensual de expensas'),
    ('Multa', 'Multas por incumplimiento de reglas'),
    ('Extraordinario', 'Cuotas o aportes extraordinarios'),
    ('Alquiler de área común', 'Salón de eventos, churrasquera, piscina, cancha'),
    ('Alquiler de parqueo', 'Parqueo o depósito adicional');

INSERT INTO tipo_departamento (nombre, descripcion, cuota_mensual) VALUES
    ('Básico', '1 dormitorio', 350.00),
    ('Clásico', '2 dormitorios', 500.00),
    ('Suite', '1 suite con baño privado', 700.00),
    ('Suite doble', '2 suites con baño privado', 950.00);

INSERT INTO tipo_egreso (nombre, descripcion) VALUES
    ('Servicios', 'Luz, agua e internet de áreas comunes'),
    ('Sueldos', 'Portero, seguridad, limpieza, jardinería'),
    ('Mantenimiento', 'Ascensor, piscina, bombas, jardín'),
    ('Reparaciones', 'Arreglos y daños'),
    ('Administrativos', 'Papelería, comisiones bancarias y otros');

-- Datos de ejemplo para los CRUD de persona, departamento y residente
INSERT INTO persona (nombre, telefono, correo) VALUES
    ('Ana Pérez', '70000001', 'ana.perez@example.com'),
    ('Luis Gómez', '70000002', 'luis.gomez@example.com'),
    ('María Rojas', '70000003', 'maria.rojas@example.com');

INSERT INTO departamento (id_condominio, numero, piso, estado, id_tipo_departamento, metros_cuadrados) VALUES
    (1, 'A-101', 1, 'activo', 1, 55.00),
    (1, 'A-201', 2, 'activo', 2, 80.50),
    (1, 'B-301', 3, 'activo', 3, 95.00);

INSERT INTO residente (id_departamento, id_persona, tipo_relacion, fecha_inicio) VALUES
    (1, 1, 'propietario', '2025-01-15'),
    (2, 2, 'propietario', '2024-06-01'),
    (2, 3, 'inquilino', '2026-03-01');

-- Usuario que registra los ingresos (la contraseña se definirá cuando se implemente el login)
INSERT INTO usuario (nombre, correo, password_hash, rol) VALUES
    ('Administrador', 'admin@condominio.com', 'pendiente-login', 'admin');

-- Cargos de ejemplo: expensas de noviembre de cada departamento según la cuota de su tipo
INSERT INTO cargo (id_departamento, id_responsable, concepto, periodo, monto, vencimiento)
SELECT d.id_departamento, d.id_propietario, 'Expensas', '2026-11-01', d.cuota_mensual, '2026-11-10'
FROM v_departamento d;
