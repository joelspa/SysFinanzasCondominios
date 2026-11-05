import Icono from './Icono';

// Título de la página con el botón para adicionar un registro.
// children: botones adicionales que van antes del botón principal
export default function Encabezado({ titulo, descripcion, textoBoton = 'Adicionar', onAdicionar, children }) {
    return (
        <div className="encabezado">
            <div>
                <h1>{titulo}</h1>
                <p>{descripcion}</p>
            </div>
            <div className="encabezado-acciones">
                {children}
                {onAdicionar && (
                    <button className="btn btn-primary" onClick={onAdicionar}>
                        <Icono nombre="mas" tamano={16} /> {textoBoton}
                    </button>
                )}
            </div>
        </div>
    );
}
