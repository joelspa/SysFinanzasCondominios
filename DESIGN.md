# Diseño del sistema

Reglas visuales del sistema de finanzas de condominios. Toda pantalla nueva debe seguirlas para que el sistema se vea como una sola pieza.

## Para quién es

Lo usan el administrador y el tesorero de un condominio, en una portátil y de forma diaria: registrar pagos y gastos, ver quién debe y entregar comprobantes impresos. Es una herramienta de trabajo: primero claridad y rapidez, después estética.

## Dirección

Claro, sobrio y de confianza: menú lateral azul marino, fondo gris muy claro, tarjetas blancas y un solo color de acento (azul). El color se reserva para lo que significa algo: estado, deuda, dinero que entra o sale.

No se rediseña: se pule. Bootstrap 5.3 más `public/css/Site.css`; sin librerías de componentes.

## Colores

Siempre con las variables de `:root` en `public/css/Site.css`, nunca con el código de color suelto.

| Uso | Variable |
|---|---|
| Acción principal, enlaces, selección | `--brand`, `--brand-oscuro`, `--brand-suave` |
| Fondo de página / tarjetas | `--fondo` / `--superficie`, `--superficie-2` |
| Texto principal / secundario / de apoyo | `--texto` / `--texto-2` / `--texto-3` |
| Pagado, al día, dinero que entra | `--bueno` (relleno), `--sube` (texto) |
| Pendiente, por vencer | `--aviso` |
| Vencido, deuda, pérdida, anular | `--critico` |
| Gráficos | `--serie` (ingresos) y naranja (gastos) |

El texto debe tener contraste mínimo 4,5:1 sobre su fondo. Un estado nunca se comunica solo con color: lleva texto o ícono.

## Tipografía

La del sistema operativo (`system-ui`), sin fuentes descargadas. Los montos usan la clase `numero` (cifras de ancho fijo, sin corte de línea) y van alineados a la derecha en las tablas.

## Dinero

- Formato único: `dinero()` de `views/formato.js` → `Bs 1.250,50`.
- Lo negativo lleva signo y color: `dineroConSigno()` → `−Bs 280,00` con la clase `baja`. Nunca un número positivo con la palabra «pérdida» al lado.
- Deuda en `texto-deuda`; saldo a favor e ingresos en `sube`.

## Recibos y comprobantes

- Número siempre con `numeroRecibo()` → `Nº 000012` (correlativo de cada condominio; nunca el id interno).
- El documento impreso lleva el monto en letras con `montoEnLetras()` → `Son: Quinientos 00/100 bolivianos`.
- Un recibo emitido no cambia de monto, fecha ni departamento: al corregirlo esos campos se muestran bloqueados y una nota explica que hay que anular y registrar otro.
- Lo anulado no se oculta: queda tachado en las listas y el documento muestra motivo, quién y cuándo (`textoAnulacion()`).

## Componentes (reutilizar antes de crear)

| Necesidad | Componente |
|---|---|
| Título de página y botón principal | `Encabezado` |
| Cifras encima de una tabla (siempre 4) | `Resumen` |
| Tabla con buscador y filtros | `PanelTabla`, `Buscador`, `Filtro`, `SinDatos` |
| Botones de cada fila | `Acciones`, `BotonIcono` |
| Formularios | `Modal`, `Campo`, `Casilla`, `Opciones` |
| Mensajes | `Alerta` (resultado de una acción), `Nota` (dentro de la página o el formulario) |
| Estado de un registro | `Estado` |
| Indicadores y gráficos del panel | `Indicador`, `Graficos`, `CifraAnimada` |
| Explicar un término («?») | `Ayuda` con una clave de `views/glosario.js` |
| Carga | `Cargando` (silueta de la página) y `SinDatos` (filas de silueta en la tabla) |

## Ayuda para quien recién empieza

El sistema lo usan personas sin experiencia contable, así que cada pantalla se explica sola.

- **Guía de cada pantalla** (`views/components/Guia.jsx` y `Recorrido.jsx`). Se abre sola la primera vez que el usuario entra a una pantalla y después con el botón «Guía de esta pantalla» de la barra superior; `?guia=1` en la dirección también la abre. Los pasos se escriben en `views/guias.js`, uno por ruta, y apuntan a elementos con el atributo `data-guia="..."` o a clases que ya existen (`.resumen`, `.panel-tabla`). Si el elemento no se ve (por ejemplo el menú en el celular), el paso se salta solo. Una pantalla nueva agrega su entrada en `GUIAS`; no hace falta tocar el componente.
- **Glosario** (`views/glosario.js`). Es la única fuente de las definiciones: el «?» de las cifras (`Indicador` y `Resumen` con la prop `ayuda`) y la página Ayuda y glosario leen de ahí. Un término se define una sola vez, en lenguaje de todos los días.
- **Primeros pasos** (`views/secciones/PrimerosPasos.jsx`). En el panel, la lista de lo que falta para empezar a cobrar; se marca sola con los datos y desaparece cuando todo está listo.
- **Estados vacíos con acción**. Una tabla vacía explica para qué sirve y ofrece el botón que la llena: `SinDatos` con `titulo`, `texto` y `accion`.
- **Siguiente paso después de guardar**. `useCrud` recibe `accionAlCrear(id)`, que devuelve `{ texto, href }`: el aviso de «se guardó» lleva ese enlace (por ejemplo «Ver e imprimir el recibo») y dura más tiempo.
- **Lo recordado** (qué guía ya vio, si ocultó los primeros pasos) se guarda en el navegador con `views/recordar.js`, separado por usuario. Si el navegador no deja guardar, la ayuda vuelve a mostrarse; nunca falla la página.

## Movimiento

Sutil y con propósito: indica qué cambió o hacia dónde mirar, nunca decora.

- Variables de `Site.css`: `--duracion-rapida` (140 ms, botones), `--duracion-normal` (220 ms, avisos, ventanas) y `--duracion-lenta` (380 ms, entrada de página), con la curva `--curva-llegada`.
- Se animan solo `opacity` y `transform`. Sin rebotes ni efectos elásticos.
- Las cifras del panel cuentan hasta su valor una vez (`CifraAnimada`); el lector de pantalla recibe el valor final.
- Con «reducir movimiento» activado en el sistema operativo, todo aparece directamente: el CSS lleva las duraciones a 1 ms y el JavaScript consulta `prefiereMenosMovimiento()`.

## Palabras

- **Disponible** es siempre dinero (caja más banco). Un departamento sin residentes está **desocupado**, no disponible: igual paga su expensa.
- La deuda pertenece al departamento, no a la persona: al traspasar, la pendiente pasa al nuevo propietario y así se explica en el sistema.

## Reglas

- **Tablas**: deben entrar completas en 1280 px de ancho. La columna de acciones lleva la clase `columna-acciones` (queda fija a la derecha si la tabla se desplaza). Meses abreviados con `mesAbreviado()` cuando el espacio es justo.
- **Tarjetas**: sin franjas de color en los bordes; el tono se marca con un punto junto a la etiqueta o con el ícono.
- **Formularios**: etiqueta visible en cada campo, el error se muestra dentro del formulario y dice cómo resolverlo, el botón nombra la acción («Registrar pago», no «Aceptar»).
- **Estados**: toda lista tiene estado vacío (con su acción), de carga (silueta, no círculo que gira) y de error.
- **Acciones que no se deshacen** (anular, eliminar, traspasar): piden confirmación y explican la consecuencia.
- **Singular y plural**: `cantidad(1, 'cargo vencido', 'cargos vencidos')`.
- **Íconos**: solo los de `views/components/Icono.jsx`; no emojis ni símbolos de texto.
- **Teclado y accesibilidad**: foco visible, botones de ícono con `aria-label`, se respeta «reducir movimiento».
- **Impresión**: lo que no va en papel lleva la clase `no-imprimir`. Los documentos (recibo, reporte, aviso) empiezan con `Membrete`. Antes de dar por terminada una pantalla imprimible hay que verla como PDF: los paneles no deben partirse entre hojas, y las barras y etiquetas de color deben salir (ver el bloque `@media print` de `Site.css`).
- **Gráficos**: barras horizontales (`BarrasHorizontales`) para comparar montos por tipo, siempre con el valor escrito al lado; azul para ingresos y naranja para gastos, nunca al revés.
- **Anchos a revisar** al terminar una pantalla: 1440, 1280 y 520 px.
