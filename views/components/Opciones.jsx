// Opciones de un <select> a partir de una lista.
//   valor: campo que va en value (por defecto 'valor')
//   texto: campo que se muestra, o una función que recibe el registro y devuelve el texto
export default function Opciones({ lista, valor = 'valor', texto = 'texto' }) {
    return lista.map((item) => (
        <option key={item[valor]} value={item[valor]}>
            {typeof texto === 'function' ? texto(item) : item[texto]}
        </option>
    ));
}
