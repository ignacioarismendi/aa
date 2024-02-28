'use strict'


var Producto = require('../models/producto');
var Review = require('../models/review');
var Inventario = require('../models/inventario');
var fs = require('fs');
var path = require('path');

const registro_producto_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let data = req.body;
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            var portada_name = name[2];
            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            data.portada = portada_name;
            let reg = await Producto.create(data);
            let inventario = await Inventario.create({
                admin: req.user.sub,
                cantidad: data.stock,
                proveedor: 'Primer registro',
                producto: reg._id
            })
            res.status(200).send({ data: reg,inventario:inventario });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

const listar_productos_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            var filtro = req.params['filtro'];

            let data = await Producto.find({ titulo: new RegExp(filtro, 'i') });
            res.status(200).send({ data: data });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

const obtener_portada = async function(req,res){
    var img = req.params['img'];
    fs.stat('./uploads/productos/'+img, function(err){
        if(!err){
            let path_img = './uploads/productos/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}
 const obtener_producto_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            
            var id = req.params['id'];
            try {
                var reg= await Producto.findById({_id:id});
                res.status(200).send({data:reg})
            } catch (error) {
                res.status(200).send({data:undefined}) 
            }
            
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }

}

const actualizar_producto_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];
            let data = req.body;
            if (req.files) {
                // Hay imagen
                var img_path = req.files.portada.path;
                var name = img_path.split('\\');
                var portada_name = name[2];
                let reg = await Producto.findByIdAndUpdate({_id:id},{
                    titulo: data.titulo,
                    stock:data.stock,
                    precio:data.precio,
                    categoria:data.categoria,
                    descripcion:data.descripcion,
                    contenido:data.contenido,
                    portada:portada_name
                });
                
                fs.stat('./uploads/productos/'+reg.portada, function(err){
                    if(!err){
                        fs.unlink('./uploads/productos/'+reg.portada,(err)=>{
                            if(err) throw err;
                        });
                    }
                })

                res.status(200).send({ data: reg });
            } else {
                // No hay imagen
                let reg = await Producto.findByIdAndUpdate({_id:id},{
                    titulo: data.titulo,
                    stock:data.stock,
                    precio:data.precio,
                    categoria:data.categoria,
                    descripcion:data.descripcion,
                    contenido:data.contenido,
                });
                res.status(200).send({ data: reg });
            }

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

const eliminar_producto_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            var id = req.params['id']

            let reg = await Producto.findById({_id:id});
            if (reg) {
                if (reg.portada) {
                    fs.stat('./uploads/productos/'+reg.portada, function(err){
                        if(!err){
                            fs.unlink('./uploads/productos/'+reg.portada,(err)=>{
                                if(err) throw err;
                            });
                        }
                    })
                }
                reg = await Producto.findByIdAndRemove({_id:id});
                res.status(200).send({data:reg});
            } else {
                res.status(404).send({message: 'ProductNotFound'})
            }
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
};


const listar_inventario_producto_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            var id = req.params['id'];
            var reg = await Inventario.find({producto: id}).populate('admin').sort({createdAct:-1});
            res.status(200).send({data:reg});

        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
}

const eliminar_inventario_producto_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            //obtener id inventario
            var id = req.params['id'];
            //eliminado inventario
            let reg = await Inventario.findByIdAndRemove({_id:id});
            //obtener registro producto
            let prod = await Producto.findById({_id:reg.producto});
            //calcular nuevo stock
            let nuevo_stock = parseInt(prod.stock)-parseInt(reg.cantidad);
            //actualizar nuevo stock en producto
            let producto = await Producto.findByIdAndUpdate({_id:reg.producto},{
                stock: nuevo_stock
            });
            res.status(200).send({data:producto});
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
}

const registro_inventario_producto_admin = async function(req,res){
    if(req.user){
        if(req.user.rol == 'admin'){
            let data = req.body;
            let reg = await Inventario.create(data);
            //obtener registro producto
            let prod = await Producto.findById({_id:reg.producto});
            //calcular nuevo stock
            let nuevo_stock = parseInt(prod.stock)+parseInt(reg.cantidad);
            //actualizar nuevo stock en producto
            let producto = await Producto.findByIdAndUpdate({_id:reg.producto},{
                stock: nuevo_stock
            });
            res.status(200).send({data:reg});
        }else{
            res.status(500).send({message: 'NoAccess'})
        }
    }else{
        res.status(500).send({message: 'NoAccess'})
    }
}
const actualizar_producto_variedades_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];
            let data = req.body;

            let reg = await Producto.findByIdAndUpdate({_id:id},{
                titulo_variedad:data.titulo_variedad,
                variedades:data.variedades,
            });
            res.status(200).send({ data: reg });
        }
        else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};
const agregar_imagen_galeria_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];
            let data = req.body;
            var img_path = req.files.imagen.path;
            var name = img_path.split('\\');
            var imagen_name = name[2];

            let reg = await Producto.findByIdAndUpdate({_id:id},{
                $push:{galeria:{
                    imagen: imagen_name,
                    _id: data._id
                }}
            });
            res.status(200).send({ data: reg });
        }
        else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};
const eliminar_imagen_galeria_admin = async function(req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];
            let data = req.body;

            let reg = await Producto.findByIdAndUpdate({_id:id},{$pull:{galeria:{
                _id:data._id
            }}}
            );
            res.status(200).send({ data: reg });
        }
        else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

//----Metodos publicos--------------------------
const listar_productos_publico = async function(req,res){
    var filtro = req.params['filtro'];
    let reg=await Producto.find({titulo:new RegExp(filtro,'i')}).sort({createdAct:-1});
    res.status(200).send({data:reg})
}

const obtener_productos_slug_publico = async function(req,res){
    var slug = req.params['slug'];
    let reg=await Producto.findOne({slug:slug});
    res.status(200).send({data:reg})
}

const listar_productos_recomendados_publico = async function(req,res){
    var categoria = req.params['categoria'];
    let reg=await Producto.find({categoria:categoria}).sort({createdAct:-1}).limit(8);
    res.status(200).send({data:reg})
}
const listar_productos_nuevos_publicos = async function(req,res){
    let reg=await Producto.find().sort({createdAct:-1}).limit(8);
    res.status(200).send({data:reg})
}
const listar_productos_masvendidos_publicos = async function(req,res){
    let reg=await Producto.find().sort({nventas:-1}).limit(8);
    res.status(200).send({data:reg})
}
const obtener_reviews_producto_publico = async function(req,res){
    let id = req.params['id'];
    let reviews = await Review.find({producto:id}).populate('cliente').sort({createdAct:-1});
    res.status(200).send({data:reviews})
}
module.exports = {
    registro_producto_admin,
    listar_productos_admin,
    obtener_portada,
    obtener_producto_admin,
    actualizar_producto_admin,
    eliminar_producto_admin,
    listar_inventario_producto_admin,
    eliminar_inventario_producto_admin,
    registro_inventario_producto_admin,
    listar_productos_publico,
    actualizar_producto_variedades_admin,
    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    obtener_productos_slug_publico,
    listar_productos_recomendados_publico,
    listar_productos_nuevos_publicos,
    listar_productos_masvendidos_publicos,
    obtener_reviews_producto_publico
};
