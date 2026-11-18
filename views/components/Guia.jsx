import { useState, useEffect } from 'react';
import Recorrido, { elementoDe } from './Recorrido';
import { guiaDe, tieneGuia } from '../guias';
import { recordado, recordar } from '../recordar';
import { parametro } from '../ruta';

const EVENTO = 'abrir-guia';
const ESPERA_MAXIMA = 5000;   // ms que se espera a que la página termine de cargar

// Abre la guía de la pantalla actual (la usa el botón «Guía de esta pantalla» de la barra superior)
export function abrirGuia() {
    window.dispatchEvent(new Event(EVENTO));
}

// true cuando la página terminó de cargar sus datos: ya no muestra la silueta de carga ni un error.
// (No se espera a un elemento en particular: en el celular, por ejemplo, el menú está cerrado.)
function paginaLista() {
    return document.querySelector('.app-principal > *') !== null && !document.querySelector('.panel-cargando, .esqueleto');
}

// Decide cuándo se muestra la guía de una pantalla:
//   - sola, la primera vez que el usuario entra a esa pantalla (o si la dirección trae ?guia=1);
//   - cuando el usuario pulsa «Guía de esta pantalla».
// No se abre sola si se llegó con otros datos en la dirección (por ejemplo, para registrar un pago):
// el usuario vino a hacer algo concreto.
export default function Guia({ ruta, usuario }) {
    const [pasos, setPasos] = useState(null);
    const vista = 'guia:' + ruta;

    function iniciar() {
        let visibles = guiaDe(ruta, usuario).filter((p) => !p.objetivo || elementoDe(p) !== null);
        if (visibles.length > 0) {
            setPasos(visibles);
        }
    }

    useEffect(() => {
        window.addEventListener(EVENTO, iniciar);
        return () => window.removeEventListener(EVENTO, iniciar);
    }, []);

    useEffect(() => {
        let pedida = parametro('guia') === '1';
        let conOtrosDatos = window.location.search !== '' && !pedida;
        if (!tieneGuia(ruta) || conOtrosDatos || (!pedida && recordado(usuario.id_usuario, vista))) {
            return;
        }
        let comienzo = Date.now();
        let espera = setInterval(() => {
            let lista = paginaLista();
            if (lista || Date.now() - comienzo > ESPERA_MAXIMA) {
                clearInterval(espera);
                if (lista) {
                    recordar(usuario.id_usuario, vista);
                    iniciar();
                }
            }
        }, 200);
        return () => clearInterval(espera);
    }, []);

    return pasos ? <Recorrido pasos={pasos} onTerminar={() => setPasos(null)} /> : null;
}
