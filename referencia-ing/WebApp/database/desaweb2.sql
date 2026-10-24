CREATE TABLE tipo (
    idTipo INT GENERATED ALWAYS AS IDENTITY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(250),
    PRIMARY KEY (idTipo)
);

CREATE TABLE Producto (
    idProducto INT GENERATED ALWAYS AS IDENTITY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(250),
    Precio NUMERIC(10,2),
    Cantidad INT,
    idTipo INT NOT NULL,
    PRIMARY KEY (idProducto),
    FOREIGN KEY (idTipo) REFERENCES Tipo(idTipo)
);

CREATE TABLE Cliente (
    idCliente INT GENERATED ALWAYS AS IDENTITY,
    CI INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Direccion VARCHAR(250),
    Telefono VARCHAR(20),
    correo VARCHAR(100),
    FechaNacimiento DATE,
    PRIMARY KEY (idCliente)
);

CREATE TABLE nota_venta (
    idNotaVenta INT GENERATED ALWAYS AS IDENTITY,
    Fecha DATE,
    Descripcion VARCHAR(250),
    idCliente INT NOT NULL,
    Total NUMERIC(10,2),
    PRIMARY KEY (idNotaVenta),
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente)
);

CREATE TABLE detalle_venta (
    idNotaVenta INT NOT NULL,
    idProducto INT NOT NULL,
    Cantidad INT NOT NULL,
    Precio NUMERIC(10,2),
    Subtotal NUMERIC(10,2),
    PRIMARY KEY (idNotaVenta, idProducto),
    FOREIGN KEY (idProducto) REFERENCES Producto(idProducto)
);

-- Datos ficticios de ejemplo. En una base ya creada, ejecutar solo desde aqui.
-- Los identificadores se generan automaticamente y los ejemplos no se duplican.
BEGIN;

INSERT INTO tipo (Nombre, Descripcion)
SELECT datos.nombre, datos.descripcion
FROM (VALUES
    ('Bebidas', 'Bebidas y refrescos'),
    ('Alimentos', 'Productos alimenticios'),
    ('Limpieza', 'Productos de limpieza')
) AS datos(nombre, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM tipo t WHERE t.nombre = datos.nombre);

INSERT INTO producto (Nombre, Descripcion, Precio, Cantidad, idTipo)
SELECT datos.nombre, datos.descripcion, datos.precio, datos.cantidad, t.idtipo
FROM (VALUES
    ('Coca Cola 2L', 'Refresco de dos litros', 15.50, 20, 'Bebidas'),
    ('Arroz 1Kg', 'Bolsa de arroz de un kilogramo', 12.00, 30, 'Alimentos'),
    ('Detergente', 'Detergente para ropa', 18.50, 10, 'Limpieza')
) AS datos(nombre, descripcion, precio, cantidad, tipo)
JOIN tipo t ON t.idtipo = (SELECT MIN(idtipo) FROM tipo WHERE nombre = datos.tipo)
WHERE NOT EXISTS (
    SELECT 1 FROM producto p WHERE p.nombre = datos.nombre AND p.idtipo = t.idtipo
);

INSERT INTO cliente (CI, Nombres, Apellidos, Direccion, Telefono, correo, FechaNacimiento)
SELECT datos.ci, datos.nombres, datos.apellidos, datos.direccion,
       datos.telefono, datos.correo, datos.fechanacimiento
FROM (VALUES
    (9000001, 'Ana', 'Perez', 'Direccion de ejemplo 1', '00000001', 'ana.perez@example.com', DATE '1998-05-12'),
    (9000002, 'Luis', 'Gomez', 'Direccion de ejemplo 2', '00000002', 'luis.gomez@example.com', DATE '1995-08-20'),
    (9000003, 'Maria', 'Rojas', 'Direccion de ejemplo 3', '00000003', 'maria.rojas@example.com', DATE '2001-02-15')
) AS datos(ci, nombres, apellidos, direccion, telefono, correo, fechanacimiento)
WHERE NOT EXISTS (SELECT 1 FROM cliente c WHERE c.ci = datos.ci);

INSERT INTO nota_venta (Fecha, Descripcion, idCliente, Total)
SELECT datos.fecha, datos.descripcion, c.idcliente, datos.total
FROM (VALUES
    (DATE '2026-10-07', 'Venta de ejemplo 001', 9000001, 43.00),
    (DATE '2026-10-08', 'Venta de ejemplo 002', 9000002, 18.50),
    (DATE '2026-10-09', 'Venta de ejemplo 003', 9000003, 24.00)
) AS datos(fecha, descripcion, ci, total)
JOIN cliente c ON c.idcliente = (SELECT MIN(idcliente) FROM cliente WHERE ci = datos.ci)
WHERE NOT EXISTS (
    SELECT 1 FROM nota_venta n WHERE n.descripcion = datos.descripcion AND n.idcliente = c.idcliente
);

INSERT INTO detalle_venta (idNotaVenta, idProducto, Cantidad, Precio, Subtotal)
SELECT n.idnotaventa, p.idproducto, datos.cantidad, datos.precio,
       datos.cantidad * datos.precio
FROM (VALUES
    ('Venta de ejemplo 001', 9000001, 'Coca Cola 2L', 'Bebidas', 2, 15.50),
    ('Venta de ejemplo 001', 9000001, 'Arroz 1Kg', 'Alimentos', 1, 12.00),
    ('Venta de ejemplo 002', 9000002, 'Detergente', 'Limpieza', 1, 18.50),
    ('Venta de ejemplo 003', 9000003, 'Arroz 1Kg', 'Alimentos', 2, 12.00)
) AS datos(venta, ci, producto, tipo, cantidad, precio)
JOIN cliente c ON c.idcliente = (SELECT MIN(idcliente) FROM cliente WHERE ci = datos.ci)
JOIN nota_venta n ON n.idnotaventa = (
    SELECT MIN(idnotaventa) FROM nota_venta
    WHERE descripcion = datos.venta AND idcliente = c.idcliente
)
JOIN tipo t ON t.idtipo = (SELECT MIN(idtipo) FROM tipo WHERE nombre = datos.tipo)
JOIN producto p ON p.idproducto = (
    SELECT MIN(idproducto) FROM producto WHERE nombre = datos.producto AND idtipo = t.idtipo
)
WHERE NOT EXISTS (
    SELECT 1 FROM detalle_venta d WHERE d.idnotaventa = n.idnotaventa AND d.idproducto = p.idproducto
);

COMMIT;
