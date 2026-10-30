-- database/schema.sql
-- Sistema de Gestión de Finanzas para Condominios (un solo condominio)
-- Ejecutar en la base de datos desaweb2: todas las tablas se crean en el esquema final

CREATE SCHEMA IF NOT EXISTS final;
SET search_path TO final;

CREATE TABLE condominio (
    id_condominio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    direccion     VARCHAR(200) NOT NULL
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
                  CHECK (rol IN ('admin', 'tesorero'))
);

CREATE TABLE cargo (
    id_cargo        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento INT NOT NULL REFERENCES departamento(id_departamento),
    concepto        VARCHAR(180) NOT NULL,
    periodo         DATE NOT NULL,                 -- poner el día 1 del mes (ej. 2026-10-01)
    monto           DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    vencimiento     DATE NOT NULL,
    estado          VARCHAR(15) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagado', 'vencido')),
    UNIQUE (id_departamento, periodo, concepto),   -- evita cargos duplicados
    UNIQUE (id_cargo, id_departamento)             -- necesario para la FK compuesta de ingreso
);

CREATE TABLE ingreso (
    id_ingreso      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_departamento INT NOT NULL REFERENCES departamento(id_departamento),
    id_tipo_ingreso INT NOT NULL REFERENCES tipo_ingreso(id_tipo_ingreso),
    id_cargo        INT,                           -- NULL = ingreso extraordinario
    id_usuario      INT NOT NULL REFERENCES usuario(id_usuario),
    concepto        VARCHAR(180) NOT NULL,
    monto           DECIMAL(18,2) NOT NULL CHECK (monto > 0),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago     VARCHAR(50) NOT NULL,
    estado          VARCHAR(15) NOT NULL DEFAULT 'registrado'
                    CHECK (estado IN ('registrado', 'anulado')),
    -- El cargo debe pertenecer al mismo departamento del pago
    FOREIGN KEY (id_cargo, id_departamento)
        REFERENCES cargo(id_cargo, id_departamento)
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
    metodo_pago    VARCHAR(50) NOT NULL DEFAULT 'efectivo'
);

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
INSERT INTO cargo (id_departamento, concepto, periodo, monto, vencimiento)
SELECT d.id_departamento, 'Expensas', '2026-11-01', t.cuota_mensual, '2026-11-10'
FROM departamento d
JOIN tipo_departamento t ON d.id_tipo_departamento = t.id_tipo_departamento;
