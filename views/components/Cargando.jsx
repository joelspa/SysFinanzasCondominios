import Icono from './Icono';

// Mientras se cargan los datos de la página muestra su silueta (tarjetas y un panel que brillan);
// si fallaron, el error. La silueta evita que la página "salte" cuando llegan los datos.
export default function Cargando({ texto = 'Cargando...', error }) {
    if (error) {
        return (
            <div className="panel panel-cargando" role="alert">
                <Icono nombre="alerta" tamano={22} /> {error}
            </div>
        );
    }
    return (
        <div role="status">
            <span className="visually-hidden">{texto}</span>
            <div className="esqueleto-tarjetas" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => <div key={i} className="esqueleto esqueleto-tarjeta" />)}
            </div>
            <div className="esqueleto esqueleto-panel" aria-hidden="true" />
        </div>
    );
}
