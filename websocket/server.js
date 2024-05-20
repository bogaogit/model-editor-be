const WebSocket = require("ws");
const { randomUUID } = require("crypto");

const wss = new WebSocket.Server({ port: 8080 }); // Replace 8080 with your desired port
let webSocketStoredActionList = []
let rooms = []

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("Client message:", message.toString());

    const body = JSON.parse(message.toString() ?? "{}")

    const {roomId, currentActionId, roomInfo, joinRoomId, webSocketAction, userInfo} = body

    switch (webSocketAction?.actionType) {
      case 'createRoom':
        const newRoom = {
          id: randomUUID(),
          ...roomInfo,
        }

        rooms.push(newRoom)

        ws.send(JSON.stringify({
            type: "createRoom",
            room: newRoom,
            userInfo: {
              userId: randomUUID(),
              userName: randomUUID(),
            },
        }))
        break
      case 'getRoomList':
        ws.send(JSON.stringify({
            type: "getRoomList",
            roomList: rooms
        }))
        break
      case 'joinRoom':
        let room
        // if (joinRoomId){
        //   room = rooms.find(e => e.id === joinRoomId)
        // } else {
        room = rooms[0]
        // }

        ws.send(JSON.stringify({
            type: "joinRoom",
            userInfo: {
              userId: randomUUID(),
              userName: randomUUID(),
            },
            room,
            actionList: webSocketStoredActionList.filter(e => e.roomId === room.id)
        }))
        break
      case 'updateEntity':
        webSocketStoredActionList.push({
          id: randomUUID(),
          roomId: body.roomId,
          webSocketAction: webSocketAction,
          userInfo: userInfo
        })
        break
      case 'syncUpdates':
        break
      case 'clearActionList':
        webSocketStoredActionList = []
        rooms = []
        break
      default:
        console.log('unknown')
    }

    let actionList = []
    if (!!currentActionId){
      const webSocketStoredActionListForRoom = webSocketStoredActionList.filter(e => e.roomId === roomId)
      const index = webSocketStoredActionListForRoom.findIndex(e => e.id === currentActionId)
      actionList = webSocketStoredActionListForRoom.slice(index + 1, webSocketStoredActionListForRoom.length)
    } else {
      actionList = webSocketStoredActionList.filter(e => e.roomId === roomId)
    }

    ws.send(JSON.stringify({
        type: "syncUpdates",
        actionList
    }))
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server listening on port 8080");
