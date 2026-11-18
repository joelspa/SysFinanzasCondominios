import { useState, useEffect, useRef } from 'react';
import { prefiereMenosMovimiento } from '../recordar';

const DURACION = 700;   // ms

// Cifra que cuenta hasta su valor cuando aparece o cambia (indicadores del panel principal).
// El lector de pantalla recibe solo el valor final; la cuenta es visual.
//   formato: función que convierte el número en texto (ej. dinero)
export default function CifraAnimada({ valor, formato }) {
    const final = Number(valor) || 0;
    const [mostrado, setMostrado] = useState(prefiereMenosMovimiento() ? final : 0);
    const anterior = useRef(prefiereMenosMovimiento() ? final : 0);

    useEffect(() => {
        let desde = anterior.current;
        anterior.current = final;
        if (prefiereMenosMovimiento() || desde === final) {
            setMostrado(final);
            return;
        }
        let inicio = performance.now();
        let cuadro;
        function avanzar(ahora) {
            let t = Math.min((ahora - inicio) / DURACION, 1);
            let suavizado = 1 - Math.pow(1 - t, 3);   // rápido al principio, se detiene con suavidad
            setMostrado(desde + (final - desde) * suavizado);
            if (t < 1) {
                cuadro = requestAnimationFrame(avanzar);
            }
        }
        cuadro = requestAnimationFrame(avanzar);
        return () => cancelAnimationFrame(cuadro);
    }, [final]);

    return (
        <>
            <span aria-hidden="true">{formato(mostrado)}</span>
            <span className="visually-hidden">{formato(final)}</span>
        </>
    );
}
