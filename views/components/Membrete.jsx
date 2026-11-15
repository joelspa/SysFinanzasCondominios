import Icono from './Icono';
import { contactoCondominio } from '../formato';

// Encabezado de los documentos que se imprimen (recibos, reporte, avisos): logo, nombre,
// dirección y contacto del condominio
export default function Membrete({ condominio }) {
    let contacto = condominio ? contactoCondominio(condominio) : '';
    return (
        <div className="d-flex align-items-center gap-3">
            <span className="menu-logo"><Icono nombre="departamentos" tamano={20} /></span>
            <div>
                <strong className="d-block">{condominio ? condominio.nombre : 'Condominio'}</strong>
                <span className="secundario">{condominio ? condominio.direccion : ''}</span>
                {contacto && <span className="secundario">{contacto}</span>}
            </div>
        </div>
    );
}
