import Ayuda from './Ayuda';

// Fila de cifras resumidas que va encima de cada tabla.
//   items: [{ etiqueta, valor, detalle?, tono?, ayuda? }]
//   tono: 'critico' | 'aviso' | 'bueno' resalta la cifra
//   ayuda: clave del glosario que explica la cifra (muestra un «?» junto a la etiqueta)
export default function Resumen({ items }) {
    return (
        <div className="resumen">
            {items.map((item) => (
                <div className={'resumen-item' + (item.tono ? ' tono-' + item.tono : '')} key={item.etiqueta}>
                    <span className="resumen-etiqueta">{item.etiqueta}{item.ayuda && <Ayuda termino={item.ayuda} />}</span>
                    <span className="resumen-valor">{item.valor}</span>
                    {item.detalle && <span className="resumen-detalle">{item.detalle}</span>}
                </div>
            ))}
        </div>
    );
}
