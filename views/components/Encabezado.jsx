// Título de la página con el botón Adicionar
export default function Encabezado({ titulo, descripcion, onAdicionar }) {
    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
                <h2 className="mb-0">{titulo}</h2>
                <p className="text-muted mb-0">{descripcion}</p>
            </div>
            <button className="btn btn-primary" onClick={onAdicionar}>+ Adicionar</button>
        </div>
    );
}
