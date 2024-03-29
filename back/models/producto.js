'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo: {type: String, required: true},
    slug: {type: String, required: true},
    galeria: [{type:Object, required: false}],
    portada: {type: String, required: true},
    precio: {type: Number, required: true},
    descripcion: {type: String, required: true},
    contenido: {type: String, required: true},
    stock: {type: Number, required: true},
    variedades: [{type:Object, require:false}],
    titulo_variedad:{type:String,require:false},
    nventas: {type: Number,default:0, required: true},
    npuntos: {type: Number,default:0, required: true},
    categoria: {type: String, required: true},
    estado: {type: String,default:'Edicion', required: true},
    createdAct:{type: Date, default: Date.now, require:true}
    
});

module.exports = mongoose.model('producto',ProductoSchema);
