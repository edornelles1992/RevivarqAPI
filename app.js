const models = require("./models")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const loginRouter = require('./routes/login')
const usersRouter = require('./routes/users')
const routerAuthUser = require('./routes/authUsers')
const adminRouter = require('./routes/admin')
const reformRouter = require('./routes/reform')
const recoveryRouter = require('./routes/recover')
const instaGaleriaRouter = require('./routes/instaGallery')
const photosRouter = require('./routes/photos')


const TokenManager = require('./Helpers/AuthManager')
var config = require('./config/config')

// Initialize server
// models.sequelize.sync().then(function() {
//     setupServer()
// }) 

function noop() {}
 
function heartbeat() {
  this.isAlive = true;
}

setupServer()

function setupServer() {

    const WebSocket = require('ws');

    const wss = new WebSocket.Server({ port: 3030 });
    var sockets = [];

    wss.on('connection', function connection(ws) {     

        if (sockets.length < 2){
            if (sockets.filter(sckt => sckt == ws).length === 0){
                sockets.push(ws)
            }

            wss.on('close', function close() {
            console.log("ENTROUUU")
            sockets = sockets.filter(sck => sck !== ws)
            console.log("NUMERO DE SOCKETS: ", sockets.length)
          });

            ws.on('message', function incoming(data) {  
                let sendingObject = JSON.parse(data.toString())
                if (sendingObject.status === "FECHAR"){
                    wss.clients.forEach(function each(client) {
                        if (client === ws && client.readyState === WebSocket.OPEN) {
                            sockets = sockets.filter(sck => sck !== ws)
                            console.log("NUMERO DE SOCKETS: ", sockets.length)
                            client.close()
                        }
                    }); 
                } else {
                        wss.clients.forEach(function each(client) {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                sendingObject = {...sendingObject, status: "ATIVO"}
                                client.send(JSON.stringify(sendingObject));
                            }
                        }); 
                    }
         });
        } else {
            wss.clients.forEach(function each(client) {
                if (client === ws && client.readyState === WebSocket.OPEN) {
                    sockets = sockets.filter(sck => sck !== ws)
                    console.log("NUMERO DE SOCKETS: ", sockets.length)
                    client.close()
                }
            }); 
        }

        console.log("NUMERO DE SOCKETS: ", sockets.length)    
    })

    const app = express()

    app.use(cors())
    app.use(bodyParser.json())
    app.use('/api/login', loginRouter)
    app.use('/api/users', usersRouter)
    app.use('/api/auth_user', TokenManager.ensureUserToken, routerAuthUser)
    app.use('/api/admin', TokenManager.ensureUserToken, adminRouter)
    app.use('/api/reform', TokenManager.ensureUserToken, reformRouter)
    app.use('/api/InstaGaleria', instaGaleriaRouter)
    app.use('/api/recover', recoveryRouter)
    app.use('/api/photos', photosRouter)
    app.maxConnections = 2
    app.listen(config.app.port, function () {
        console.log(`Server listening on port ${config.app.port}`)
    })
}