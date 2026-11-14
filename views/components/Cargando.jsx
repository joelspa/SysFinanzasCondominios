import Icono from './Icono';

// Panel que ocupa la página mientras se cargan sus datos, o muestra el error si fallaron
export default function Cargando({ texto = 'Cargando...', error }) {
    return (
        <div className="panel panel-cargando">
            {error
                ? <><Icono nombre="alerta" tamano={22} /> {error}</>
                : <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span> {texto}</>}
        </div>
    );
}
