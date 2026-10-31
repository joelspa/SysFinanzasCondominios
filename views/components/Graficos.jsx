import { useState } from 'react';
import { dinero, dineroCorto } from '../formato';

// Calcula un tope "redondo" para el eje vertical, dividido en 4 partes iguales
function escala(maximo) {
    if (maximo <= 0) {
        return { tope: 1000, paso: 250 };
    }
    let bruto = maximo / 4;
    let potencia = 10 ** Math.floor(Math.log10(bruto));
    let paso = [1, 2, 2.5, 5, 10].find((factor) => factor * potencia >= bruto) * potencia;
    return { tope: paso * 4, paso };
}

// Columnas por mes. Al pasar el mouse (o con Tab) se ve el detalle de cada mes.
export function GraficoColumnas({ datos }) {
    const [activo, setActivo] = useState(null);
    const { tope, paso } = escala(Math.max(...datos.map((d) => d.valor)));
    const marcas = [0, 1, 2, 3, 4].map((i) => i * paso);
    const ultimo = datos.length - 1;

    return (
        <div className="gc">
            <div className="gc-eje">
                {marcas.map((marca) => (
                    <span key={marca} style={{ bottom: (marca / tope * 100) + '%' }}>{dineroCorto(marca)}</span>
                ))}
            </div>
            <div className="gc-area">
                {marcas.map((marca) => (
                    <div key={marca} className="gc-linea" style={{ bottom: (marca / tope * 100) + '%' }}></div>
                ))}
                <div className="gc-columnas">
                    {datos.map((d, i) => {
                        let alto = d.valor / tope * 100;
                        return (
                            <div key={d.clave} className={'gc-columna' + (activo === i ? ' activa' : '')} tabIndex="0"
                                aria-label={d.detalle + ': ' + dinero(d.valor)}
                                onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                                onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}>
                                <div className="gc-barra" style={{ height: alto + '%' }}></div>
                                {activo === i ? (
                                    <div className="gc-tooltip" style={{ bottom: `calc(min(${alto}%, 100% - 72px) + 10px)` }}>
                                        <strong>{d.detalle}</strong>
                                        <span>{dinero(d.valor)}</span>
                                        <small>{d.cantidad} {d.cantidad === 1 ? 'pago' : 'pagos'}</small>
                                    </div>
                                ) : (i === ultimo && d.valor > 0 && (
                                    <span className="gc-valor" style={{ bottom: `calc(${alto}% + 6px)` }}>{dineroCorto(d.valor)}</span>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="gc-etiquetas">
                {datos.map((d, i) => (
                    <span key={d.clave} className={i === ultimo ? 'actual' : ''}>{d.etiqueta}</span>
                ))}
            </div>
            <table className="visually-hidden">
                <caption>Ingresos por mes</caption>
                <tbody>
                    {datos.map((d) => (
                        <tr key={d.clave}><th>{d.detalle}</th><td>{dinero(d.valor)}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Barra apilada con la proporción de cada estado y su leyenda con montos
export function BarraEstados({ segmentos }) {
    let visibles = segmentos.filter((s) => s.monto > 0);
    return (
        <>
            <div className="be-barra">
                {visibles.map((s) => (
                    <span key={s.clave} className={'be-segmento ' + s.tono} style={{ flexGrow: s.monto }}
                        title={s.etiqueta + ': ' + dinero(s.monto)}></span>
                ))}
            </div>
            <ul className="be-leyenda">
                {segmentos.map((s) => (
                    <li key={s.clave}>
                        <span className={'punto ' + s.tono}></span>
                        <span className="flex-grow-1">
                            {s.etiqueta}
                            <small className="secundario">{s.cantidad} {s.cantidad === 1 ? 'cargo' : 'cargos'}</small>
                        </span>
                        <span className="numero fw-semibold">{dinero(s.monto)}</span>
                    </li>
                ))}
            </ul>
        </>
    );
}

// Barras horizontales ordenadas de mayor a menor
export function BarrasHorizontales({ datos }) {
    let maximo = Math.max(...datos.map((d) => d.valor), 1);
    return (
        <ul className="bh">
            {datos.map((d) => (
                <li key={d.etiqueta}>
                    <div className="bh-texto">
                        <span>{d.etiqueta}</span>
                        <span className="numero fw-semibold">{dinero(d.valor)}</span>
                    </div>
                    <div className="bh-pista">
                        <span style={{ width: (d.valor / maximo * 100) + '%' }}></span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
