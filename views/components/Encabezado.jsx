import Icono from './Icono';

// Título de la página con el botón para adicionar un registro
export default function Encabezado({ titulo, descripcion, textoBoton = 'Adicionar', onAdicionar }) {
    return (
        <div className="encabezado">
            <div>
                <h1>{titulo}</h1>
                <p>{descripcion}</p>
            </div>
            {onAdicionar && (
                <button className="btn btn-primary" onClick={onAdicionar}>
                    <Icono nombre="mas" tamano={16} /> {textoBoton}
                </button>
            )}
        </div>
    );
}
