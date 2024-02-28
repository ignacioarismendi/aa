'use strict'
var Venta = require('../models/venta')
var Dventa = require('../models/dventa')
var Producto = require('../models/producto')
var Carrito = require('../models/carrito')
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');



const registro_compra_cliente = async function(req,res){
    if(req.user){
        var data = req.body;
        var detalles = data.detalles;
        let venta_last = await Venta.find().sort({createdAct:-1});
        var serie;
        var correlativo;
        var n_venta;
        if (venta_last.length == 0){
            serie = '001';
            correlativo = '000001'
            n_venta = serie + '-' + correlativo;

        }else{
            var last_nventa = venta_last[0].nventa;
            var arr_nventa = last_nventa.split('-');
            if(arr_nventa[1] != '999999'){
                var new_correlativo = zfill(parseInt(arr_nventa[1])+1,6);
                n_venta = arr_nventa[0]+ '-' + new_correlativo
            }else if(arr_nventa[1] == '999999'){
                var new_serie = zfill(parseInt(arr_nventa[0])+1,3);
                n_venta = new_serie+ '-000001' 

            }


        }
        data.nventa = n_venta;
        data.estado = 'Procesando';
        console.log(data);
        let venta = await Venta.create(data);
        var detalles = data.detalles;
        detalles.forEach(async element => {
            element.venta = venta._id;
            await Dventa.create(element);
            let element_producto = await Producto.findById({_id:element.producto});
            let new_stock = element_producto.stock - element.cantidad;
            await Producto.findByIdAndUpdate({_id:element.producto},{
                stock: new_stock,
                nventas: element_producto.nventas +1 

            })
            //limpiar carrito
            await Carrito.deleteMany({ cliente: data.cliente });

        });
        res.status(200).send({ venta:venta});
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
}
const iniciar_pago = async (req, res) => {
  const transbankUrl = 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.0/transactions';

  const data = {
    "buy_order": "ordenCompra12345678",
    "session_id": "sesion1234557545",
    "amount": 10000,
    "return_url": "http://www.comercio.cl/webpay/retorno"
   };

  try {
    const response = await axios.post(transbankUrl, data, {
      headers: {
        'Tbk-Api-Key-Id': '597055555532',
        'Content-Type': 'application/json',
      },
    });

    // Aquí deberías redirigir al usuario a la URL de pago proporcionada por Transbank
    res.redirect(response.data.url);
  } catch (error) {
    console.error('Error al iniciar el pago:', error);
    res.status(500).send('Error al iniciar el pago');
  }
};
  


function zfill(number, width) {
    var numberOutput = Math.abs(number); 
    var length = number.toString().length;
    var zero = "0";
    
    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }

    }
}

const enviar_correo_compra_cliente = async function(req,res){
    var id = req.params['id'];
    var readHTMLFile = function(path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    //OBTENER ACCESOS DE CUENTA CORREO EMISOR

    /* 
    1. Verificacion en dos pasos: https://www.google.com/landing/2step/
    2. Acceso y Seguridad / Permitir el acceso de aplicaciones menos seguras
    3. Autorizacion: https://security.google.com/settings/security/apppasswords 
    */
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
        user: 'nachovega755@gmail.com',
        pass: 'iymypqgtcbnzuddy'
        }
    }));

    var venta = await Venta.findById({_id:id}).populate('cliente');
    var detalles = await Dventa.find({venta:id}).populate('producto');
    var cliente = venta.cliente.nombres +' '+venta.cliente.apellidos;
    var _id = venta._id;
    var fecha = new Date(venta.createdAct);
    var data = detalles;
    var subtotal = venta.subtotal;
    var precio_envio = venta.envio_precio
    var cantidad = Dventa.cantidad
    var cupon = Venta.cupon
    var variedad = Dventa.variedad

    readHTMLFile(process.cwd() + '/mail.html', (err, html)=>{
                        
        let rest_html = ejs.render(html, {data: data,cliente:cliente,_id:_id,fecha:fecha,subtotal:subtotal,precio_envio:precio_envio,cantidad:cantidad,cupon:cupon,variedad:variedad});
    
        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});
    
        var mailOptions = {
            from: 'nachovega755@gmail.com',
            to: venta.cliente.email,
            subject: 'Gracias por tu compra, RayenSPA',
            html: htmlToSend
        };
        res.status(200).send({data:true});
        transporter.sendMail(mailOptions, function(error, info){
            if (!error) {
                console.log('Email sent: ' + info.response);
            }
        });
      
    });
}

module.exports = {
    registro_compra_cliente,
    enviar_correo_compra_cliente,
    iniciar_pago,
    mercadoPago: {
        clientId: '223089703',
        clientSecret: '510633271239909',
        sandbox: true // Cambiar a "false" en producción
    }
}