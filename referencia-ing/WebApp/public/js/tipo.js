var _datosTipos;

function eliminarExitoso(resultado, e, elemento) {
    $("#eliminarTipo").modal("hide");
    if (resultado.Success) {
        $(e.currentTarget).closest('tr').remove();
        _datosTipos.remove(elemento);
        toastr.success("El Tipo'" + elemento.nombre + " '   se ha eliminado satisfactoriamente");
    } else {
        toastr.error(resultado.Mensaje);
    }
}

function confirmarEliminar(e, elemento) {
    var url = "/tipo/eliminarTipo";
    var tipo = 'POST';
    var datos = { idtipo: elemento.idtipo };
    var tipoDatos = 'JSON';
    solicitudAjax(url, function (response) { eliminarExitoso(response, e, elemento); }, datos, tipoDatos, tipo);
}

function mostrarEliminarTipo(e, elemento) {
    var modal = '#eliminarTipo';
    $(modal).find(".modal-title").html('Eliminar Tipo');
    $(modal).find(".text-mensaje-modal").html('Esta seguro que desea eliminar el Tipo '
        + "'" + elemento.nombre + "'    ?");
    $(modal).find(".modal-body").css({ 'min-height': 100 + "px" });    
    $(modal).modal({ backdrop: 'static', keyboard: false });
    $(modal).modal("show");
    $("#btnConfirmarEliminar").unbind('click').click(function () {
        confirmarEliminar(e, elemento);
    });    
}

function guardarTipoExitoso(respuesta, elemento) {
    if (respuesta.Success) {
        $("#agregarTipo").modal("hide");
        if (elemento) {
            elemento.nombre = $("#txtNombre").val();
            elemento.descripcion = $("#txtDescripcion").val();
        } else { 
            var tipo = {
                idtipo: parseInt(respuesta.Data),
                nombre: $("#txtNombre").val(),
                descripcion: $("#txtDescripcion").val(),
            };
            _datosTipos.push(tipo);
        }            
        mostrarDatosTipos();
        toastr.success("El Tipo se ha guardado satisfactoriamente ");
    } else {
        toastr.error(respuesta.Mensaje);
    }    
}

function guardarTipo(idtipo, elemento) {
    var url = "/tipo/guardarTipo";
    var tipo = 'POST';
    var datos = {
        idtipo: idtipo,
        nombre: $("#txtNombre").val(),
        descripcion: $("#txtDescripcion").val(),
    };
    var tipoDatos = 'JSON';
    solicitudAjax(url, function (response) { guardarTipoExitoso(response, elemento); }
        , datos, tipoDatos, tipo);
}

function limpiarDatosTipo() {
    $("#txtNombre").val("");
    $("#txtDescripcion").val("");
    $("#btnEditar").hide();
    $("#btnGuardar").show();
}

function mostrarModalTipo() {
    var modal = '#agregarTipo';
    limpiarDatosTipo();
    $(modal).find(".modal-title").html('Adicionar Tipo');
    $(modal).find(".modal-dialog").css({ 'width': 700 + "px" });
    $(modal).find(".modal-body").css({ 'min-height': 150 + "px" });
    $(modal).modal({ backdrop: 'static', keyboard: false });
    $(modal).modal("show");
}

function editarDatos(elemento) {
    $("#txtNombre").val(elemento.nombre);
    $("#txtDescripcion").val(elemento.descripcion);
    $("#btnGuardar").hide();
    $("#btnEditar").show();
}

function eventoActualizarTipo(input, elemento) {
    $(input).unbind('click').click(function () {
        var modal = '#agregarTipo';
        editarDatos(elemento);
        $(modal).find(".modal-title").html('Editar Tipo : ' + "'" + 
            elemento.nombre + "'");
        $(modal).find(".modal-dialog").css({ 'width': 700 + "px" });
        $(modal).modal({ backdrop: 'static', keyboard: false });
        $(modal).modal("show");
        $("#btnEditar").unbind('click').click(function (event) {
            event.preventDefault();
            guardarTipo(elemento.idtipo, elemento);
        });
    });
}

function mostrarDatosTipos() {
    limpiarTabla('tblTipo');
    $.each(_datosTipos, function (index, elemento) {
        var fila = $('<tr>').attr('id', elemento.idtipo);
        fila.append(col(elemento.idtipo).addClass("alinearCentro"));
        //fila.append(col(elemento.nombre ).addClass("alinearIzquierda"));
        var input = crearSpan("lblEdit" + index, "spanHyperLink", elemento.nombre);
        eventoActualizarTipo(input, elemento);
        fila.append(col(input));
        fila.append(col(elemento.descripcion ).addClass("alinearIzquierda"));
        fila.append(col(AccionColumna(function (e) { mostrarEliminarTipo(e, elemento) }
            , 'trash', 'Eliminar')).addClass("alinearCentro"));
        $('#tblTipo tbody').append(fila);
    });
}

function getTiposExitoso(resultado) {
    if (resultado.Success) {
        toastr.success("Cargado Exitoso");
        _datosTipos = resultado.Data;
        mostrarDatosTipos();        
    } else {
        toastr.error(resultado.Mensaje);
    }
}

function init() { 
    let url = "/tipo/obtenerTipos";
    let tipo = 'GET';
    let datos = {};
    let tipoDatos = 'JSON';
    solicitudAjax(url, getTiposExitoso, datos, tipoDatos, tipo);
}

$(document).ready(function () {
    init();  
    $('#btnAdicionar').click(function () { mostrarModalTipo(); });  
    $('#btnCancelar').click(function () { $("#agregarTipo").modal("hide"); });  
    $("#btnGuardar").click(function () { guardarTipo(0); });
    $('#btnCancelarEliminar').click(function () { $("#eliminarTipo").modal("hide"); });              
});
