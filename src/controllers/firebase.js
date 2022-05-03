const CryptoJS = require("crypto-js");
const admin = require("firebase-admin");
const serviceAccount = require('../helpers/serviceAccount.json');
const Jimp = require('jimp');
const fs = require("fs");
const UUID = require("uuidv4");
const { parse } = require("path");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "michel-alvarez-studio.appspot.com"
});

exports.holaMundo = (req, res, next) => {
    res.send("<h1>Hola mundo por michel alvarez</h1>");
}


exports.upload = async (req, res, next) => {
    //inicialización de firebase
    var bucket;
    var tipo;
    var bytes  = (CryptoJS.AES.decrypt(req.body.auth, 'Y2Fhdg==')).toString(CryptoJS.enc.Utf8);
    if (bytes == "key_kLk5kE7ypVw6jkU1yWrwxg") {
        let file = req.files;
        var image, url;
        image = {width: 1080, height: 1080, location:'producto'};
        var name = `${req.body.name}-${Math.random().toString(36).substr(2)}-${image.width}-${image.height}`
        if (file) {
            console.log('entro if');
            tipo = file.data.mimetype.split('/');
            Jimp.read(file.data.data , (err, lenna) => {
                console.log("entro jimp");
                if (err){
                    return res.send({"success": false, "type": "Error en renderizar imagen."});
                }
                lenna
                .resize(image.width, image.height)
                .quality(0) // set JPEG quality
                .write(`./src/images/imagen-${image.width}-${image.height}.${tipo[1]}`)
                setTimeout(() => {
                    let uuid = UUID();
                    if (bucket == undefined) {
                        bucket = admin.storage().bucket();
                    }
    
                    bucket.upload(`./src/images/imagen-${image.width}-${image.height}.${tipo[1]}`, {
                        destination: `imagenes/${image.location}/${req.body.name}/${name}`,
                        
                        gzip: true,
                        metadata: {
                            cacheControl: 'public, max-age=31536000',
                            firebaseStorageDownloadTokens: uuid
                        }
                    }).then( async (data) => {
                        fs.unlink(`./src/images/imagen-${image.width}-${image.height}.${tipo[1]}`, (err) => {  // data[key] devuelve el valor del campo
                            if (err) {
                                return res.send({"success": false, "type": "Error al eliminar 1.1.0"});
                            }
                        });
    
                        let file = data[0];
                        var arrayURL = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
    
                        url = arrayURL;
                        
                        return res.send({"success": true, "dataURL": url});
    
                    }).catch(err => {
                        console.log(err);
                        fs.unlink(`./src/images/imagen-${image.width}-${image.height}`, (err) => {  // data[key] devuelve el valor del campo
                            if (err) {
                                return res.send({"success": false, "type": "Error al eliminar 2.1.0"});
                            }
                        });
                        return res.send({"success": false, "type": "Error al subir imagen"});
                    });
                }, 2000);
            });
        } else {
            return res.send({"success": false, "type": "Error en el archivo"});
        }
    } else {
        return res.send({"success": false, "type": "Error en autentificacion"});
    }
}

exports.uploadGaleria = async (req, res, next) => {
    //inicialización de firebase
    var bucket;
    var tipo;
    var bytes  = (CryptoJS.AES.decrypt(req.body.auth, 'Y2Fhdg==')).toString(CryptoJS.enc.Utf8);
    if (bytes == "key_kLk5kE7ypVw6jkU1yWrwxg") {
        let file = req.files;
        var image, url;
        image = {width: parseInt(req.body.ancho), height: parseInt(req.body.alto), location:'producto'};
        var name = `${req.body.name}-${Math.random().toString(36).substr(2)}-${image.width}-${image.height}`
        if (file) {
            console.log('entro if');
            tipo = file.data.mimetype.split('/');
            Jimp.read(file.data.data , (err, lenna) => {
                if (err){
                    return res.send({"success": false, "type": "Error en renderizar imagen."});
                }
                lenna
                .resize(image.width, image.height)
                .quality(0) // set JPEG quality
                .write(`./src/images/${req.body.name}-${image.width}-${image.height}.${tipo[1]}`);
                let uuid = UUID();
                if (bucket == undefined) {
                    bucket = admin.storage().bucket();
                }

                bucket.upload(`./src/images/${req.body.name}-${image.width}-${image.height}.${tipo[1]}`, {
                    destination: `imagenes/${image.location}/${req.body.name}/galeria/${name}`,
                    
                    gzip: true,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                        firebaseStorageDownloadTokens: uuid
                    }
                }).then( async (data) => {
                    fs.unlink(`./src/images/${req.body.name}-${image.width}-${image.height}.${tipo[1]}`, (err) => {  // data[key] devuelve el valor del campo
                        if (err) {
                            return res.send({"success": false, "type": "Error al eliminar 1.1.0"});
                        }
                    });

                    let file = data[0];
                    var arrayURL = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;

                    url = {"url": arrayURL, "name": name};
                    
                    return res.send({"success": true, "dataURL": url});

                }).catch(err => {
                    fs.unlink(`./src/images/${req.body.name}-${image.width}-${image.height}`, (err) => {  // data[key] devuelve el valor del campo
                        if (err) {
                            return res.send({"success": false, "type": "Error al eliminar 2.1.0"});
                        }
                    });
                    return res.send({"success": false, "type": "Error al subir imagen"});
                });
            });
        } else {
            return res.send({"success": false, "type": "Error en el archivo"});
        }
    } else {
        return res.send({"success": false, "type": "Error en autentificacion"});
    }
}
