// Barra fina que muestra qué parte del total está cubierta (ej. cuánto se pagó de un cargo)
export default function BarraProgreso({ valor, total }) {
    let porcentaje = total > 0 ? Math.min(valor / total * 100, 100) : 0;
    return (
        <div className={'progreso' + (porcentaje >= 100 ? ' completo' : '')} role="progressbar"
            aria-valuenow={Math.round(porcentaje)} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: porcentaje + '%' }}></span>
        </div>
    );
}
