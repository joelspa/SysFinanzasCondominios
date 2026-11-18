import Icono from './Icono';
import Ayuda from './Ayuda';

// Tarjeta de indicador del panel principal: etiqueta, cifra grande y un detalle debajo
//   ayuda: clave del glosario que explica la cifra (opcional, muestra un «?» junto a la etiqueta)
export default function Indicador({ etiqueta, valor, icono, tono = '', ayuda, children }) {
    return (
        <div className="indicador">
            <div className="indicador-cabecera">
                <span className="indicador-etiqueta">{etiqueta}{ayuda && <Ayuda termino={ayuda} />}</span>
                <span className={'indicador-icono ' + tono}><Icono nombre={icono} tamano={18} /></span>
            </div>
            <div className="indicador-valor">{valor}</div>
            {children}
        </div>
    );
}
