import Icono from './Icono';

// Tarjeta de indicador del panel principal: etiqueta, cifra grande y un detalle debajo
export default function Indicador({ etiqueta, valor, icono, tono = '', children }) {
    return (
        <div className="indicador">
            <div className="indicador-cabecera">
                <span className="indicador-etiqueta">{etiqueta}</span>
                <span className={'indicador-icono ' + tono}><Icono nombre={icono} tamano={18} /></span>
            </div>
            <div className="indicador-valor">{valor}</div>
            {children}
        </div>
    );
}
