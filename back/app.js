'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors'); // Importa el paquete cors
var port = process.env.PORT || 4201;

var server = require('http').createServer(app);
var io = require('socket.io')(server,{
    cors: {origin:'*'}
});

io.on('connection',function(socket){
    socket.on('delete-carrito',function(data){
        io.emit('new-carrito',data);
    })

    socket.on('add-carrito-add',function(data){
        io.emit('new-carrito-add',data);
    })
})

var cliente_route = require('./routes/cliente');
var admin_route = require('./routes/admin');
var producto_route = require('./routes/producto');
var cupon_route = require('./routes/cupon');
var config_route = require('./routes/config');
var carrito_route = require('./routes/carrito');
var venta_route = require('./routes/venta');
var descuento_route = require('./routes/descuento');

// Nota: Utiliza Promesas en lugar de una función de devolución de llamada (callback)
mongoose.connect('mongodb://127.0.0.1:27017/tienda', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a la base de datos');
        
        // Escucha en el puerto especificado una vez que la conexión a la base de datos sea exitosa
        server.listen(port, function() {
            console.log('Servidor corriendo en el puerto ' + port);
        });
    })
    .catch(err => 
        {
        console.log('Error al conectarse a la base de datos:', err);
    }
);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb' ,extended: true}));

app.use(cors()); // Usa el middleware cors

app.use('/api',cliente_route);
app.use('/api',admin_route);
app.use('/api',producto_route);
app.use('/api',cupon_route);
app.use('/api',config_route);
app.use('/api',carrito_route);
app.use('/api',venta_route);
app.use('/api',descuento_route);


module.exports = app;

