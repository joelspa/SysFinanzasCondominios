// Fila de cifras resumidas que va encima de cada tabla
export default function Resumen({ items }) {
    return (
        <div className="resumen">
            {items.map((item) => (
                <div className="resumen-item" key={item.etiqueta}>
                    <span className="resumen-etiqueta">{item.etiqueta}</span>
                    <span className="resumen-valor">{item.valor}</span>
                </div>
            ))}
        </div>
    );
}
