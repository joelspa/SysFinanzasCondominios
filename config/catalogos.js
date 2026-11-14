// Catálogos editables del sistema. Todos tienen la misma forma (id, nombre, descripción...),
// así que comparten un solo modelo y un solo controlador (catalogoModel / catalogoController).
//   tabla, id, campos: dónde se guardan
//   uso:      subconsulta que cuenta los registros que usan cada fila (t = fila del catálogo)
//   usadoPor: cómo se nombran esos registros en los mensajes [singular, plural]
// Los nombres de tabla y columnas salen solo de aquí, nunca de lo que envía el usuario.
module.exports = {
    tipoDepartamento: {
        tabla: 'tipo_departamento', id: 'id_tipo_departamento', campos: ['nombre', 'descripcion', 'cuota_mensual'],
        uso: 'SELECT COUNT(*) FROM departamento d WHERE d.id_tipo_departamento = t.id_tipo_departamento',
        usadoPor: ['departamento', 'departamentos']
    },
    tipoIngreso: {
        tabla: 'tipo_ingreso', id: 'id_tipo_ingreso', campos: ['nombre', 'descripcion'],
        uso: 'SELECT COUNT(*) FROM ingreso i WHERE i.id_tipo_ingreso = t.id_tipo_ingreso',
        usadoPor: ['pago', 'pagos']
    },
    tipoEgreso: {
        tabla: 'tipo_egreso', id: 'id_tipo_egreso', campos: ['nombre', 'descripcion'],
        uso: 'SELECT COUNT(*) FROM egreso e WHERE e.id_tipo_egreso = t.id_tipo_egreso',
        usadoPor: ['gasto', 'gastos']
    }
};
