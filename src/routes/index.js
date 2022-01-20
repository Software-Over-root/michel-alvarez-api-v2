const express = require("express");
const router = express.Router();

const conekta = require("../controllers/conekta");
const firebaseRouter = require("../controllers/firebase");

module.exports = function(){

    router.post('/auth/michel-alvarez/v1/conekta', conekta.pago);

    router.post('/auth/michel-alvarez/v1/firebase-upload', firebaseRouter.upload);

    router.post('/auth/michel-alvarez/v1/firebase-upload-galeria', firebaseRouter.uploadGaleria);

    router.get('/', firebaseRouter.holaMundo);

    router.post('/auth/michel-alvarez/v1/ventas', conekta.ordenes);

    router.post('/auth/michel-alvarez/v1/venta-id', conekta.orden);

    return router;
}