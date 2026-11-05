import { capitalizar } from '../formato';

// Tono de la etiqueta según el estado del registro
const tonos = {
    activo: 'bueno',
    registrado: 'bueno',
    pagado: 'bueno',
    disponible: 'bueno',
    pendiente: 'aviso',
    parcial: 'info',
    ocupado: 'info',
    vencido: 'critico'
};

// Muestra el estado (activo, pagado, parcial, vencido, etc.) como una etiqueta con un punto de color
export default function Estado({ valor }) {
    let tono = tonos[valor] || 'neutro';
    return <span className={'estado estado-' + tono}>{capitalizar(valor)}</span>;
}
