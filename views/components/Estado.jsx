// Color de la etiqueta según el estado del registro
const colores = {
    activo: 'text-bg-success',
    registrado: 'text-bg-success',
    pagado: 'text-bg-success',
    pendiente: 'text-bg-warning',
    vencido: 'text-bg-danger'
};

// Muestra el estado (activo, registrado, pendiente, etc.) como una etiqueta de color
export default function Estado({ valor }) {
    let color = colores[valor] || 'text-bg-secondary';
    return <span className={'badge ' + color}>{valor}</span>;
}
