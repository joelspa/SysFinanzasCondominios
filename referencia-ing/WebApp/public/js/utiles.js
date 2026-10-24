function adicionarOpcionesCombo(elemento, items, evento, prop) {
    prop = prop || { id: 'id', value: 'value' };
    $.each(items, function (index, item) {
        $(elemento).append($('<option>').val(item[prop.id]).text(item[prop.value]));
    });
    if (evento)
        $(elemento).change(function (e) { evento(e, $(elemento).val()); });
}

Array.prototype.remove = function (item) {
    var i = this.indexOf(item);
    if (i != -1)
        this.splice(i, 1);
};

function AccionColumna(evento, classIcono, title) {
    title = title || "";
    return $('<button>', { title: title, class: "btn btn-outline-primary btn-sm" })
        .append("<img src='/public/icons/" + classIcono + ".svg' alt='Eliminar'>").click(function (e) {
        e.preventDefault();
        evento(e);
    });
}

function col(data) {
    var td = $('<td>').html(data);
    return td;
}

function crearSpan(id, cssClase, contenido) {
    return $("<span>", { id: id }).addClass(cssClase).html(contenido);
}

function limpiarTabla(elemento) {
    $('#' + elemento).find('tbody tr').remove();
}

function solicitudAjax(solicitudUrl, onSuccess, data, tipoDato, tipo) {
    $.ajax({
        type: tipo,
        datatype: tipoDato,
        traditional: false,
        url: solicitudUrl,
        data: data,
        success: function (responseText) {
            if (onSuccess)
                onSuccess(responseText);
        },
        error: function (exception) {
        }
    });
}