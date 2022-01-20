const express = require("express");
const routes = require("./src/routes");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
var compression = require('compression');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config();



//conexion con https
/*const httpsServerOptions = {
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH),
};*/

//creacion del servidor
const app = express();

//mayor seguridad de despliegue
app.use(helmet());

//compresion de datos para disminuir el trafico
app.use(compression());

//incorporando politicas CORS
app.use(cors());

//morgan
app.use(morgan('dev'));

//bodyParser
//le damos un limite de peso a los datos enviados por json
app.use(bodyParser.json({limit: '20mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

//configuarcion para mover archivos
app.use(fileUpload());

//configuracion de los cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

    app.options('*', (req, res) => {
        // allowed XHR methods  
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});
//fin de los cors

//rutas
app.use("/", routes());

//conexion con http
const serverHttp = http.createServer(app);
//const serverHttps = https.createServer(httpsServerOptions, app);


//inico de servidor
serverHttp.listen(process.env.HTTP_PORT || 3000, process.env.IP);
//serverHttps.listen(process.env.HTTPS_PORT || 30, process.env.IP);
console.log('server on port ', process.env.HTTP_PORT, ' server on ip ', process.env.IP);

