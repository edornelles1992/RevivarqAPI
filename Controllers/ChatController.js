const WebSocket = require('ws')
const { setWsHeartbeat }  = require("ws-heartbeat/server");
    
module.exports = function iniciaChat(){

    const wss = new WebSocket.Server({ port: 3030 });
    var sockets = [];
    var socketsNaFila = [];

    setWsHeartbeat(wss, (ws, data, flag) => {
        if (data === '{"kind":"ping"}') {
            ws.send('{"kind":"pong"}');
        }
    }, 10000); // in 60 seconds, if no message accepted from client, close the connection.

    wss.on('connection', function connection(ws) {   

        if (sockets.length < 2){ 
            if (sockets.filter(sckt => sckt == ws).length === 0){
                sockets.push(ws)
            }

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

        ws.on('close', function close() {
            console.log("DESCONTECADO POR INATIVIDADE...")
            sockets = sockets.filter(sck => sck !== ws)
            console.log("NUMERO DE SOCKETS: ", sockets.length)
          });

        console.log("NUMERO DE SOCKETS: ", sockets.length)    
    })
}