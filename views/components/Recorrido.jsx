import { useState, useEffect, useLayoutEffect, useRef } from 'react';

const MARGEN = 8;          // espacio entre el elemento resaltado y el borde del resaltado
const SEPARACION = 14;     // espacio entre el resaltado y la tarjeta
const ANCHO_TARJETA = 340;
const BORDE = 16;          // la tarjeta nunca toca los bordes de la ventana
const ALTO_BARRA = 64;     // barra superior fija: lo que queda debajo de ella no se ve

// Elemento que resalta un paso, o null si el paso va centrado o el elemento no se ve
// (no existe, está oculto o fuera de la pantalla, como el menú cerrado en el celular)
export function elementoDe(paso) {
    let elemento = paso.objetivo ? document.querySelector(paso.objetivo) : null;
    if (!elemento) {
        return null;
    }
    let r = elemento.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth ? elemento : null;
}

// Lleva el elemento a la vista si hace falta. Los elementos altos (una tabla) se muestran desde arriba.
function llevarALaVista(elemento) {
    if (elemento.closest('.menu-lateral, .barra-superior')) {
        elemento.scrollIntoView({ block: 'nearest' });
        return;
    }
    let r = elemento.getBoundingClientRect();
    let visible = r.top >= ALTO_BARRA + MARGEN && r.bottom <= window.innerHeight - MARGEN;
    if (!visible) {
        let alto = window.innerHeight - ALTO_BARRA;
        let destino = r.height > alto * 0.6 ? r.top - ALTO_BARRA - 24 : r.top - ALTO_BARRA - (alto - r.height) / 2;
        window.scrollTo({ top: window.scrollY + destino, behavior: 'instant' });
    }
}

// Parte visible del elemento (una tabla larga se resalta solo hasta el borde de la ventana)
function zonaVisible(elemento) {
    let r = elemento.getBoundingClientRect();
    let arriba = elemento.closest('.menu-lateral, .barra-superior') ? r.top : Math.max(r.top, ALTO_BARRA + MARGEN);
    let abajo = Math.min(r.bottom, window.innerHeight - MARGEN);
    return { top: arriba, left: r.left, width: r.width, height: Math.max(abajo - arriba, 0), bottom: abajo, right: r.right };
}

// Dónde va la tarjeta: debajo del resaltado, si no cabe arriba, si no a un costado y, si nada cabe,
// en la esquina inferior derecha. Sin resaltado, al centro.
function ubicarTarjeta(zona, altoTarjeta) {
    let ancho = Math.min(ANCHO_TARJETA, window.innerWidth - BORDE * 2);
    let vw = window.innerWidth, vh = window.innerHeight;
    if (!zona) {
        return { left: (vw - ancho) / 2, top: Math.max(BORDE, (vh - altoTarjeta) / 2), ancho };
    }
    let left = Math.min(Math.max(zona.left - MARGEN, BORDE), vw - ancho - BORDE);
    let distancia = MARGEN + SEPARACION;
    if (zona.bottom + distancia + altoTarjeta <= vh - BORDE) {
        return { left, top: zona.bottom + distancia, ancho };
    }
    if (zona.top - distancia - altoTarjeta >= BORDE) {
        return { left, top: zona.top - distancia - altoTarjeta, ancho };
    }
    let top = Math.min(Math.max(zona.top, BORDE), vh - altoTarjeta - BORDE);
    if (zona.right + distancia + ancho <= vw - BORDE) {
        return { left: zona.right + distancia, top, ancho };
    }
    if (zona.left - distancia - ancho >= BORDE) {
        return { left: zona.left - distancia - ancho, top, ancho };
    }
    return { left: vw - ancho - BORDE, top: vh - altoTarjeta - BORDE, ancho };
}

// Recorrido guiado: oscurece la página, resalta un elemento por paso y explica para qué sirve.
// No bloquea la página: se puede seguir usando mientras la guía está abierta.
//   pasos: [{ objetivo, titulo, texto }] ya filtrados (todos sus elementos están en pantalla)
//   onTerminar(): se llama al terminar o al saltar la guía
export default function Recorrido({ pasos, onTerminar }) {
    const [indice, setIndice] = useState(0);
    const [zona, setZona] = useState(null);
    const [lugar, setLugar] = useState(null);
    const tarjeta = useRef(null);
    const paso = pasos[indice];
    const ultimo = indice === pasos.length - 1;

    function medir() {
        let elemento = elementoDe(paso);
        let nuevaZona = elemento ? zonaVisible(elemento) : null;
        setZona(nuevaZona);
        setLugar(ubicarTarjeta(nuevaZona, tarjeta.current ? tarjeta.current.offsetHeight : 200));
    }

    // Al cambiar de paso: llevar el elemento a la vista, medir y poner el foco en la tarjeta (antes de pintar)
    useLayoutEffect(() => {
        let elemento = elementoDe(paso);
        if (elemento) {
            llevarALaVista(elemento);
        }
        medir();
        tarjeta.current.focus({ preventScroll: true });
    }, [indice]);

    useEffect(() => {
        function tecla(e) {
            if (e.key === 'Escape') {
                onTerminar();
            } else if (e.key === 'ArrowRight') {
                siguiente();
            } else if (e.key === 'ArrowLeft') {
                anterior();
            }
        }
        window.addEventListener('resize', medir);
        window.addEventListener('scroll', medir, true);
        document.addEventListener('keydown', tecla);
        return () => {
            window.removeEventListener('resize', medir);
            window.removeEventListener('scroll', medir, true);
            document.removeEventListener('keydown', tecla);
        };
    }, [indice]);

    function siguiente() {
        if (ultimo) {
            onTerminar();
        } else {
            setIndice(indice + 1);
        }
    }

    function anterior() {
        if (indice > 0) {
            setIndice(indice - 1);
        }
    }

    return (
        <div className="recorrido">
            {zona
                ? <div className="recorrido-foco" aria-hidden="true" style={{
                    top: zona.top - MARGEN, left: zona.left - MARGEN, width: zona.width + MARGEN * 2, height: zona.height + MARGEN * 2
                }} />
                : <div className="recorrido-fondo" aria-hidden="true" />}

            <div ref={tarjeta} className="recorrido-tarjeta" role="dialog" aria-labelledby="recorrido-titulo" tabIndex={-1}
                style={lugar ? { top: lugar.top, left: lugar.left, width: lugar.ancho } : { visibility: 'hidden' }}>
                {/* key: el contenido aparece suavemente en cada paso, mientras la tarjeta se desliza a su lugar */}
                <div key={indice} className="recorrido-contenido">
                    <div className="recorrido-progreso">
                        <span>Paso {indice + 1} de {pasos.length}</span>
                        <span className="recorrido-puntos" aria-hidden="true">
                            {pasos.map((p, i) => <span key={i} className={i === indice ? 'actual' : i < indice ? 'visto' : ''} />)}
                        </span>
                    </div>
                    <h2 id="recorrido-titulo">{paso.titulo}</h2>
                    <p>{paso.texto}</p>
                </div>
                <div className="recorrido-acciones">
                    {!ultimo && <button type="button" className="recorrido-saltar" onClick={onTerminar}>Saltar guía</button>}
                    {indice > 0 && <button type="button" className="btn btn-light btn-sm" onClick={anterior}>Anterior</button>}
                    <button type="button" className="btn btn-primary btn-sm" onClick={siguiente}>{ultimo ? 'Entendido' : 'Siguiente'}</button>
                </div>
            </div>
        </div>
    );
}
