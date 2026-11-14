// Fila de cifras resumidas que va encima de cada tabla.
//   items: [{ etiqueta, valor, detalle?, tono? }]  tono: 'critico' | 'aviso' | 'bueno' resalta la cifra
export default function Resumen({ items }) {
    return (
        <div className="resumen">
            {items.map((item) => (
                <div className={'resumen-item' + (item.tono ? ' tono-' + item.tono : '')} key={item.etiqueta}>
                    <span className="resumen-etiqueta">{item.etiqueta}</span>
                    <span className="resumen-valor">{item.valor}</span>
                    {item.detalle && <span className="resumen-detalle">{item.detalle}</span>}
                </div>
            ))}
        </div>
    );
}
