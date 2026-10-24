const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
const indexrouter = require('./routers/indexRouter');
const tipoRouter = require('./routers/tipoRouter');
const productoRouter = require('./routers/productoRouter');
const clienteRouter = require('./routers/clienteRouter');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));

app.use('/', indexrouter);
app.use('/tipo', tipoRouter);
app.use('/producto', productoRouter);
app.use('/cliente', clienteRouter);

app.listen(port, () => {
    console.log(`Escuchando en: http://localhost:${port}`);  
});
