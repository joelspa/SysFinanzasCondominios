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

// Columnas por mes, con una o varias series (cada serie con su color y leyenda).
// Al pasar el mouse (o con Tab) se ve el detalle del mes.
//   series: [{ clave, etiqueta, clase }]   clase: 'serie-1' | 'serie-2'
//   datos:  [{ clave, etiqueta, detalle, valores: { [clave de serie]: número }, nota? }]
//           nota: línea extra al final del detalle (ej. el resultado del mes)
export function GraficoColumnas({ datos, series }) {
    const [activo, setActivo] = useState(null);
    const valor = (d, serie) => d.valores[serie.clave] || 0;
    const { tope, paso } = escala(Math.max(0, ...datos.flatMap((d) => series.map((s) => valor(d, s)))));
    const marcas = [0, 1, 2, 3, 4].map((i) => i * paso);
    const ultimo = datos.length - 1;
    const varias = series.length > 1;

    return (
        <div>
            {varias && (
                <ul className="gc-leyenda">
                    {series.map((s) => <li key={s.clave}><span className={'gc-muestra ' + s.clase}></span>{s.etiqueta}</li>)}
                </ul>
            )}
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
                            let altos = series.map((s) => valor(d, s) / tope * 100);
                            let altoMayor = Math.max(...altos);
                            return (
                                <div key={d.clave} className={'gc-columna' + (activo === i ? ' activa' : '')} tabIndex="0"
                                    aria-label={d.detalle + ': ' + series.map((s) => s.etiqueta + ' ' + dinero(valor(d, s))).join(', ')}
                                    onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                                    onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}>
                                    <div className={'gc-grupo' + (varias ? ' varias' : '')}>
                                        {series.map((s, j) => (
                                            <div key={s.clave} className={'gc-barra ' + s.clase} style={{ height: altos[j] + '%' }}></div>
                                        ))}
                                    </div>
                                    {activo === i ? (
                                        <div className="gc-tooltip" style={{ bottom: `calc(min(${altoMayor}%, 100% - 90px) + 10px)` }}>
                                            <strong>{d.detalle}</strong>
                                            {series.map((s) => (
                                                <span key={s.clave} className="gc-tooltip-fila">
                                                    {varias && <span className={'gc-muestra ' + s.clase}></span>}
                                                    {varias && s.etiqueta + ': '}{dinero(valor(d, s))}
                                                </span>
                                            ))}
                                            {d.nota && <small>{d.nota}</small>}
                                        </div>
                                    ) : (!varias && i === ultimo && altoMayor > 0 && (
                                        <span className="gc-valor" style={{ bottom: `calc(${altoMayor}% + 6px)` }}>
                                            {dineroCorto(valor(d, series[0]))}
                                        </span>
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
                    <caption>Montos por mes</caption>
                    <thead><tr><th>Mes</th>{series.map((s) => <th key={s.clave}>{s.etiqueta}</th>)}</tr></thead>
                    <tbody>
                        {datos.map((d) => (
                            <tr key={d.clave}><th>{d.detalle}</th>{series.map((s) => <td key={s.clave}>{dinero(valor(d, s))}</td>)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
//   clase: color de las barras ('serie-1' por defecto)
export function BarrasHorizontales({ datos, clase = 'serie-1' }) {
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
                        <span className={clase} style={{ width: (d.valor / maximo * 100) + '%' }}></span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
