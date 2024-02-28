'use strict'

const { log } = require('console');
var Config = require('../models/config');
var fs = require('fs')
var path = require('path')

const obtener_config_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){

            let reg = await Config.findById("64b55eb29b2e3e85ed08b8f2",{
            })
            console.log(reg);
            res.status(200).send({ data: reg });
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
}

const actualizar_config_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            let data = req.body;
            console.log('Datos recibidos en el servidor:', data);
            if (req.files) {
                console.log('si hay imagen');
              
                // Hay imagen
                var img_path = req.files.logo.path;
                var name = img_path.split('\\');
                var logo_name = name[2];
              
                let reg = await Config.findByIdAndUpdate("64b55eb29b2e3e85ed08b8f2", {
                  categorias:data.categorias,
                  titulo: data.titulo,
                  serie: data.serie,
                  correlativo: data.correlativo,
                  logo: logo_name, // Asignar el nuevo nombre de archivo a reg.logo
                });
                console.log(logo_name)
                fs.stat('./uploads/configuraciones/' + reg.logo, function(err) {
                  if (!err) {
                    fs.unlink('./uploads/configuraciones/' + reg.logo, (err) => {
                      if (err) throw err;
                    });
                  }
                });
              
                console.log('Datos actualizados:', reg);
                res.status(200).send({ data: reg });
              
              
            }else{
                console.log('no hay imagen')
                let reg = await Config.findByIdAndUpdate("64b55eb29b2e3e85ed08b8f2", {
                    categorias: data.categorias,
                    titulo: data.titulo,
                    serie: data.serie,
                    correlativo: data.correlativo
                });
                  

                res.status(200).send({data:reg})
                console.log('Datos actualizados:', reg);
            }
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }

}

const obtener_logo = async function(req,res){
    var img = req.params['img'];
    console.log(img);
    fs.stat('./uploads/configuraciones/'+img, function(err){
        if(!err){
            let path_img = './uploads/configuraciones/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

const obtener_config_publico = async function(req,res){
    let reg = await Config.findById({_id:"64b55eb29b2e3e85ed08b8f2"})
    res.status(200).send({ data: reg });
}

module.exports = {
    actualizar_config_admin,
    obtener_config_admin,
    obtener_logo,
    obtener_config_publico
}