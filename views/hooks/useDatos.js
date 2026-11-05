import { useState, useEffect } from 'react';
import { obtener } from '../api';

// Carga datos de la API para mostrarlos. recargar() los vuelve a pedir.
//   inicial: valor de "datos" mientras no responde la API (con la misma forma que su Data)
export default function useDatos(url, inicial) {
    const [datos, setDatos] = useState(inicial);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    async function recargar() {
        let resultado = await obtener(url);
        setCargando(false);
        if (resultado.Success) {
            setDatos(resultado.Data);
            setError('');
        } else {
            setError(resultado.Mensaje);
        }
    }

    useEffect(() => { recargar(); }, [url]);

    return { datos, cargando, error, recargar };
}
