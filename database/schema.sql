-- database/schema.sql
-- Sistema de Gestión de Finanzas para Condominios (un solo condominio)

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

-- Tabla intermedia: resuelve la relación N:M entre departamento y persona
CREATE TABLE depdop (
    id_depdop       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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