import { capitalizar } from '../formato';

// Tono de la etiqueta según el estado del registro
const tonos = {
    activo: 'bueno',
    registrado: 'bueno',
    pagado: 'bueno',
    pendiente: 'aviso',
    vencido: 'critico'
};

// Muestra el estado (activo, registrado, pendiente, etc.) como una etiqueta con un punto de color
export default function Estado({ valor }) {
    let tono = tonos[valor] || 'neutro';
    return <span className={'estado estado-' + tono}>{capitalizar(valor)}</span>;
}
