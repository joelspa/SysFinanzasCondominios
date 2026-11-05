// Tarjeta con la barra de búsqueda y filtros, el contador de registros y la tabla.
// children son las partes de la tabla: <thead>, <tbody> y opcionalmente <tfoot>.
export default function PanelTabla({ herramientas, mostrados, total, children }) {
    return (
        <section className="panel panel-tabla">
            <div className="tabla-herramientas">
                {herramientas}
                <span className="tabla-conteo">{mostrados} de {total} registros</span>
            </div>
            <div className="table-responsive">
                <table className="table table-hover tabla">{children}</table>
            </div>
        </section>
    );
}
