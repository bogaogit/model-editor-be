const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 }); // Replace 8080 with your desired port
const stateUpdateActions = []
const clients = [];

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.push(ws)

  ws.on('message', (message) => {
    console.log('Client message:', message.toString());
    const data = JSON.parse(message.toString())
    stateUpdateActions.push(data);
    // You can process the received message here

    clients.forEach(client => client.send(message.toString()));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server listening on port 8080');
