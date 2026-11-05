// Pestañas para cambiar entre secciones de una página.
//   pestanas: [{ clave, texto, contador? }]
export default function Pestanas({ pestanas, activa, onCambiar }) {
    return (
        <div className="pestanas" role="tablist">
            {pestanas.map((pestana) => (
                <button key={pestana.clave} type="button" role="tab" aria-selected={activa === pestana.clave}
                    className={'pestana' + (activa === pestana.clave ? ' activa' : '')} onClick={() => onCambiar(pestana.clave)}>
                    {pestana.texto}
                    {pestana.contador !== undefined && <span className="pestana-contador">{pestana.contador}</span>}
                </button>
            ))}
        </div>
    );
}
