'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: true},
    nventa: {type: String, require: true},
    subtotal: {type: Number, require: true},
    envio_titulo: {type: String, require: true},
    envio_precio: {type: Number, require: true},
    transaccion: {type: String, require: false},
    cupon: {type: String, require: true},
    estado: {type: String, require: true},
    direccion: {type: Schema.ObjectId, ref: 'direccion', require: true},
    nota: {type: String, require: true},
    createdAct:{type: Date, default: Date.now, require:true}
    
});

module.exports = mongoose.model('venta',VentaSchema);