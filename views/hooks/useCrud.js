import { useState, useEffect } from 'react';
import { enviar, sinNulos } from '../api';
import useDatos from './useDatos';

// Lógica común de las páginas de registros: listar, adicionar, editar y eliminar.
// La página solo decide qué muestra y cómo es su formulario.
//   rutas:   { obtener, guardar, eliminar } de la API
//   id:      campo clave del registro (ej. 'id_persona')
//   nombre:  cómo se nombra el registro en los avisos (ej. 'La persona')
//   inicial: valor de "datos" mientras no responde la API (con la misma forma que su Data)
//   accionAlCrear(id): enlace que se ofrece en el aviso después de crear un registro (opcional),
//                      ej. { texto: 'Ver el recibo', href: '/ingreso/comprobante?id=' + id }
export default function useCrud({ rutas, id, nombre, inicial, accionAlCrear }) {
    const lista = useDatos(rutas.obtener, inicial);
    const [formulario, setFormulario] = useState(null);   // registro que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // registro que se va a eliminar (null = sin confirmar)
    const [error, setError] = useState('');               // error que se muestra dentro del formulario
    const [mensaje, setMensaje] = useState(null);         // aviso flotante { tipo, texto, accion }

    function avisar(tipo, texto, accion = null) {
        setMensaje({ tipo, texto, accion });
    }

    useEffect(() => {
        if (lista.error) {
            avisar('danger', lista.error);
        }
    }, [lista.error]);

    function abrirFormulario(registro) {
        setError('');
        setFormulario(sinNulos(registro));
    }

    // Mezcla cambios en el formulario abierto (para campos que modifican a otros)
    function actualizarFormulario(cambios) {
        setFormulario((actual) => ({ ...actual, ...cambios }));
    }

    function cambiar(e) {
        actualizarFormulario({ [e.target.name]: e.target.value });
    }

    async function guardar() {
        let resultado = await enviar(rutas.guardar, formulario);
        if (resultado.Success) {
            let creado = formulario[id] == 0;
            setFormulario(null);
            avisar('success', nombre + ' se guardó correctamente', creado && accionAlCrear ? accionAlCrear(resultado.Data) : null);
            lista.recargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar(rutas.eliminar, { [id]: aEliminar[id] });
        setAEliminar(null);
        if (resultado.Success) {
            avisar('success', nombre + ' se eliminó correctamente');
            lista.recargar();
        } else {
            avisar('danger', resultado.Mensaje);
        }
    }

    // Acción adicional de la página (ej. anular, generar expensas): si sale bien avisa y recarga la lista.
    // Devuelve el mensaje de error (o null si salió bien) para mostrarlo en el modal que la ejecutó.
    //   textoExito: texto del aviso, o función que lo arma con la Data de la respuesta
    async function ejecutar(ruta, datos, textoExito) {
        let resultado = await enviar(ruta, datos);
        if (!resultado.Success) {
            return resultado.Mensaje;
        }
        avisar('success', typeof textoExito === 'function' ? textoExito(resultado.Data) : textoExito);
        lista.recargar();
        return null;
    }

    return {
        datos: lista.datos, cargando: lista.cargando, recargar: lista.recargar,
        formulario, error, abrirFormulario, actualizarFormulario, cambiar, guardar,
        cerrarFormulario: () => setFormulario(null),
        aEliminar, eliminar,
        confirmarEliminar: (registro) => setAEliminar(registro),
        cancelarEliminar: () => setAEliminar(null),
        ejecutar,
        mensaje, avisar,
        cerrarMensaje: () => setMensaje(null)
    };
}
