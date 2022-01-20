const CryptoJS = require("crypto-js");
const conekta = require("conekta");
const axios = require("axios");
const nodemailer = require("nodemailer");

/*  funciones donde se hace la venta de conekta */
exports.pago = (req, res, next) => {
    var bytes  = (CryptoJS.AES.decrypt(req.body.auth, 'Y2Fhdg==')).toString(CryptoJS.enc.Utf8);
    if (bytes == "key_kLk5kE7ypVw6jkU1yWrwxg") {  
      var productos = req.body.productos, cantidades = req.body.cantidades, precios = req.body.precios;
      var line_items = new Array;
      var precio, mensaje = "";
      
      for (let i = 0; i < productos.length; i++) {
        precio = parseFloat(precios[i]) * 100;
        mensaje = mensaje + cantidades[i] + " " + productos[i] + " con un costo de $" + parseFloat(precios[i]).toFixed(2) +"<br/>"
        line_items.push({
          "name": productos[i],
          "unit_price": precio,
          "quantity": parseInt(cantidades[i])
        });
      }
      
      conekta.api_key = "key_MkHjpbzcHxfjuFafB5QabA";//llave privada
      conekta.locale = 'es';

      const orden = {
        "currency": "MXN",
        "customer_info": {
          "name": req.body.nombre,
          "phone": req.body.cel,
          "email": req.body.correo
        },
        "line_items": line_items,
        "charges": [{
          "payment_method": {
            "type": "card",
            "token_id": req.body.token
          }
        }]
      }
      conekta.Order.create(orden)
      .then(async function (result) {
        const correo = async (id) => {
          let transporter = nodemailer.createTransport({
              host: "mail.michelalvarezstudio.com",
              port: 587,
              secure: false,
              auth: {
                  user: "compras@michelalvarezstudio.com",
                  pass: "asjdj767dasd7asd",
              },
              tls: {
                  rejectUnauthorized: false
              }
          });
  
          let mailOptions = {
              from: '"Compra exitosa" <compras@michelalvarezstudio.com>',
              to: req.body.correo,
              subject: "Compra Michel Alvarez Studio",
              text: "Gracias por tu compra, este es tu codigo de compra: " + id,
              html: "<b>Gracias por tu compra, este es tu codigo de compra: " + id + "</b><br/>" + 
              "<p>Su compra fue de: <br/> " + mensaje + "<p/>",
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error){
                console.log({error});
                res.send({"success": true, "data": {"id": result.toObject().id}, "type":"Su correo de compra no pudo ser envio por favor guarde su codigo."});
              } else {
                console.log("Email sent");
                res.send({"success": true, "data": {"id": result.toObject().id}, "type":"Se envio un correo de confirmacion de compra."});
            }
          });
        }
        correo(result.toObject().id);
      }, function (error) {
        console.log("Error en pago: ", error);
        res.send({"success": false, "type": error.details[0].message});
      })
    } else {
        res.send({"success": false, "type": "Error en autentificacion"});
    }
}

//*  funciones donde se traen las ordenes acorde a una fecha */
exports.ordenes = (req, res, next) => {
  var bytes  = (CryptoJS.AES.decrypt(req.body.auth, 'Y2Fhdg==')).toString(CryptoJS.enc.Utf8);
  if (bytes == "key_kLk5kE7ypVw6jkU1yWrwxg") {  
    let url = "https://api.conekta.io/orders";

    axios.get(url, {
      headers: {
        "Access-Control-Allow-Origin" : "*",
        'Accept': 'application/vnd.conekta-v2.0.0+json',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Basic ' + req.body.authorization
      },
      params: {
        "expand": "[last_payment_info]",
        "limit": "150",
        "created_at.lte": req.body.fecha_final,
        "created_at.gte": req.body.fecha_inicial
      }
    })
    .then((response) => {
        var response = response.data;
        var total = 0;
        var total_cargos = 0;
        response.data.forEach(element => {
          if (element.payment_status !== undefined) {
            total = total + parseFloat(element.amount / 100);
            total_cargos = total_cargos + parseFloat(element.charges.data[0].fee / 100);
          }
        });
        res.send({"success": true, "type": "Consulta exitosas", "res": response, total, total_cargos});
    },
    (error) => {
        var status = error.response;
        res.send({"success": false, "type": "Error en obtener datos de conekta", "res": status});
    });
  } else {
    res.send({"success": false, "type": "Error en autentificacion"});
  }
}

//*  funciones donde se traen una orden en especifico por su identificador */
exports.orden = (req, res, next) => {
  var bytes  = (CryptoJS.AES.decrypt(req.body.auth, 'Y2Fhdg==')).toString(CryptoJS.enc.Utf8);
  if (bytes == "key_kLk5kE7ypVw6jkU1yWrwxg") {  
    let url = "https://api.conekta.io/orders/" + req.body.id;


    axios.get(url, {
      headers: {
        "Access-Control-Allow-Origin" : "*",
        'Accept': 'application/vnd.conekta-v2.0.0+json',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Basic ' + req.body.authorization
      }
    })
    .then((response) => {
        var response = response.data;
        res.send({"success": true, "type": "Consulta exitosas", "res": response});
    },
    (error) => {
        var status = error.response;
        res.send({"success": false, "type": "Error en obtener datos de conekta", "res": status});
    });
  } else {
    res.send({"success": false, "type": "Error en autentificacion"});
  }
}
