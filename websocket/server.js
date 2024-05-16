const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 }); // Replace 8080 with your desired port
const stateUpdateActions = [];
const clients = [];
const modelData = {
  entityData: undefined,
  applicationModel: undefined
};

wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.push(ws);

  ws.on("message", (message) => {
    console.log("Client message:", message.toString());
    const data = JSON.parse(message.toString());

    switch (data.type) {
      case "fetchModel":
        ws.send(JSON.stringify({
          type: "fetchModel",
          data: {
            entityData: modelData.entityData,
            applicationModel: modelData.applicationModel,
            actions: stateUpdateActions,
          }
        }))
        break;
      case "loadModel":
        modelData.entityData = data.data.entityData;
        modelData.applicationModel = data.data.applicationModel;
        console.log("Model loaded");
        break;
      default:
        stateUpdateActions.push(data);
        clients.forEach(client => client.send(message.toString()));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server listening on port 8080");
