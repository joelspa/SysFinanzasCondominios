var _datosClientes = [];

function eliminarExitoso(resultado, e, elemento) {
    $("#eliminarCliente").modal("hide");
    if (resultado.Success) {
        $(e.currentTarget).closest('tr').remove();
        _datosClientes.remove(elemento);
        toastr.success("El Cliente'" + elemento.nombres + " '   se ha eliminado satisfactoriamente");
    } else {
        toastr.error(resultado.Mensaje);
    }
}

function confirmarEliminar(e, elemento) {
    var url = "/cliente/eliminarCliente";
    var cliente = 'POST';
    var datos = { idcliente: elemento.idcliente };
    var clienteDatos = 'JSON';
    solicitudAjax(url, function (response) { eliminarExitoso(response, e, elemento); }, datos, clienteDatos, cliente);
}

function mostrarEliminarCliente(e, elemento) {
    var modal = '#eliminarCliente';
    $(modal).find(".modal-title").text('Eliminar Cliente');
    $(modal).find(".text-mensaje-modal").text('Esta seguro que desea eliminar el Cliente '
        + "'" + elemento.nombres + "'    ?");
    $(modal).find(".modal-body").css({ 'min-height': 100 + "px" });    
    $(modal).modal({ backdrop: 'static', keyboard: false });
    $(modal).modal("show");
    $("#btnConfirmarEliminar").unbind('click').click(function () {
        confirmarEliminar(e, elemento);
    });    
}

function guardarClienteExitoso(respuesta, elemento) {
    if (respuesta.Success) {
        $("#agregarCliente").modal("hide");
        if (elemento) {
            elemento.ci = $("#txtCI").val();
            elemento.nombres = $("#txtNombres").val();
            elemento.apellidos = $("#txtApellidos").val();
            elemento.direccion = $("#txtDireccion").val();
            elemento.telefono = $("#txtTelefono").val();
            elemento.correo = $("#txtCorreo").val();
            elemento.fecnac = $("#txtFecNac").val();
        } else { 
            var cliente = {
                idcliente: parseInt(respuesta.Data),
                ci: $("#txtCI").val(),
                nombres: $("#txtNombres").val(),
                apellidos: $("#txtApellidos").val(),
                direccion: $("#txtDireccion").val(),
                telefono: $("#txtTelefono").val(),
        correo: $("#txtCorreo").val(),
        fecnac: $("#txtFecNac").val() || null,
            };
            _datosClientes.push(cliente);
        }            
        mostrarDatosClientes();
        toastr.success("El Cliente se ha guardado satisfactoriamente ");
    } else {
        toastr.error(respuesta.Mensaje);
    }    
}

function guardarCliente(idcliente, elemento) {
    var url = "/cliente/guardarCliente";
    var cliente = 'POST';
    var datos = {
        idcliente: idcliente,
        ci: $("#txtCI").val(),
        nombres: $("#txtNombres").val(),
        apellidos: $("#txtApellidos").val(),
        direccion: $("#txtDireccion").val(),
        telefono: $("#txtTelefono").val(),
        correo: $("#txtCorreo").val(),
        fecnac: $("#txtFecNac").val() || null,
    };
    var clienteDatos = 'JSON';
    solicitudAjax(url, function (response) { guardarClienteExitoso(response, elemento); }
        , datos, clienteDatos, cliente);
}

function limpiarDatosCliente() {
    $("#txtCI").val("");
    $("#txtNombres").val("");
    $("#txtApellidos").val("");
    $("#txtDireccion").val("");
    $("#txtTelefono").val("");
    $("#txtCorreo").val("");
    $("#txtFecNac").val("");
    $("#btnEditar").hide();
    $("#btnGuardar").show();
}

function mostrarModalCliente() {
    var modal = '#agregarCliente';
    limpiarDatosCliente();
    $(modal).find(".modal-title").text('Adicionar Cliente');
    $(modal).find(".modal-dialog").css({ 'width': 700 + "px" });
    $(modal).find(".modal-body").css({ 'min-height': 150 + "px" });
    $(modal).modal({ backdrop: 'static', keyboard: false });
    $(modal).modal("show");
}

function editarDatos(elemento) {
    $("#txtCI").val(elemento.ci);
    $("#txtNombres").val(elemento.nombres);
    $("#txtApellidos").val(elemento.apellidos);
    $("#txtDireccion").val(elemento.direccion);
    $("#txtTelefono").val(elemento.telefono);
    $("#txtCorreo").val(elemento.correo);
    $("#txtFecNac").val(elemento.fecnac ? elemento.fecnac.slice(0, 10) : "");
    $("#btnGuardar").hide();
    $("#btnEditar").show();
}

function eventoActualizarCliente(input, elemento) {
    $(input).unbind('click').click(function () {
        var modal = '#agregarCliente';
        editarDatos(elemento);
        $(modal).find(".modal-title").text('Editar Cliente : ' + "'" + 
            elemento.nombres + "'");
        $(modal).find(".modal-dialog").css({ 'width': 700 + "px" });
        $(modal).modal({ backdrop: 'static', keyboard: false });
        $(modal).modal("show");
        $("#btnEditar").unbind('click').click(function (event) {
            event.preventDefault();
            guardarCliente(elemento.idcliente, elemento);
        });
    });
}

function mostrarDatosClientes() {
    limpiarTabla('tblCliente');
    $.each(_datosClientes, function (index, elemento) {
        var fila = $('<tr>').attr('id', elemento.idcliente);
        fila.append(col(elemento.idcliente).addClass("alinearCentro"));
        fila.append(col().text(elemento.ci).addClass("alinearCentro"));
        var input = crearSpan("lblEdit" + index, "spanHyperLink", "").text(elemento.nombres);
        eventoActualizarCliente(input, elemento);
        fila.append(col(input));
        fila.append(col().text(elemento.apellidos).addClass("alinearIzquierda"));
        fila.append(col().text(elemento.direccion).addClass("alinearIzquierda"));
        fila.append(col().text(elemento.telefono).addClass("alinearIzquierda"));
        fila.append(col().text(elemento.correo).addClass("alinearIzquierda"));
        fila.append(col().text(elemento.fecnac ? elemento.fecnac.slice(0, 10) : "").addClass("alinearCentro"));
        fila.append(col(AccionColumna(function (e) { mostrarEliminarCliente(e, elemento) }
            , 'trash', 'Eliminar')).addClass("alinearCentro"));
        $('#tblCliente tbody').append(fila);
    });
}

function getClientesExitoso(resultado) {
    if (resultado.Success) {
        toastr.success("Cargado Exitoso");
        _datosClientes = resultado.Data;
        mostrarDatosClientes();        
    } else {
        toastr.error(resultado.Mensaje);
    }
}

function init() { 
    let url = "/cliente/obtenerClientes";
    let cliente = 'GET';
    let datos = {};
    let clienteDatos = 'JSON';
    solicitudAjax(url, getClientesExitoso, datos, clienteDatos, cliente);
}

$(document).ready(function () {
    init();  
    $('#btnAdicionar').click(function () { mostrarModalCliente(); });  
    $('#btnCancelar').click(function () { $("#agregarCliente").modal("hide"); });  
    $("#btnGuardar").click(function () { guardarCliente(0); });
    $('#btnCancelarEliminar').click(function () { $("#eliminarCliente").modal("hide"); });              
});