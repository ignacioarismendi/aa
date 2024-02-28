'use strict'

var express = require('express');
var adminController = require('../controllers/AdminController');
var auth = require('../middlewares/authentivate');
var api = express.Router();

api.post('/registro_admin',adminController.registro_admin);
api.post('/login_admin',adminController.login_admin);
api.get('/obtener_mensajes_admin',auth.auth,adminController.obtener_mensajes_admin);
api.put('/cerrar_mensajes_admin/:id',auth.auth,adminController.cerrar_mensajes_admin);
api.get('/obtener_ventas_admin/:desde?/:hasta?',auth.auth,adminController.obtener_ventas_admin);
api.put('/cambiar_estado_pedido_admin/:id',auth.auth,adminController.cambiar_estado_pedido_admin);
module.exports = api;