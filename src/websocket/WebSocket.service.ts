import "reflect-metadata";
import { inject, injectable } from 'inversify'
import { WebSocket } from "ws";
import { randomUUID } from "crypto";

@injectable()
export class WebSocketService {
  private wss: WebSocket.Server
  private webSocketStoredActionList = []
  private rooms = []
  private clients = [];

  constructor(
  ) {
    this.wss = new WebSocket.Server({ port: 8080 });
    this.wss.on("connection", (ws) => {
      this.setupServerMessageHandler(ws)
    })
  }

  setupServerMessageHandler(ws: any): void {
    console.log("New client connected");
    this.clients.push(ws);

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

          this.rooms.push(newRoom)

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
            roomList: this.rooms
          }))
          break
        case 'joinRoom':
          let room
          // if (joinRoomId){
          //   room = this.rooms.find(e => e.id === joinRoomId)
          // } else {
          room = this.rooms[0]
          // }

          ws.send(JSON.stringify({
            type: "joinRoom",
            userInfo: {
              userId: randomUUID(),
              userName: randomUUID(),
            },
            room,
            actionList: this.webSocketStoredActionList.filter(e => e.roomId === room.id)
          }))
          break
        case 'updateEntity':
          const action = {
            id: randomUUID(),
            roomId: body.roomId,
            webSocketAction: webSocketAction,
            userInfo: userInfo
          }

          this.webSocketStoredActionList.push(action)

          break
        case 'updateEntityAndSync':
          const updateEntityAndSyncAction = {
            id: randomUUID(),
            roomId: body.roomId,
            webSocketAction: webSocketAction,
            userInfo: userInfo
          }

          this. webSocketStoredActionList.push(updateEntityAndSyncAction)

          this.clients.forEach(client => client.send(JSON.stringify({
            type: "syncLatestAction",
            actionList: [updateEntityAndSyncAction]
          })));

          break
        case 'syncUpdates':
          let actionList = []
          if (!!currentActionId){
            const webSocketStoredActionListForRoom = this.webSocketStoredActionList.filter(e => e.roomId === roomId)
            const index = webSocketStoredActionListForRoom.findIndex(e => e.id === currentActionId)
            actionList = webSocketStoredActionListForRoom.slice(index + 1, webSocketStoredActionListForRoom.length)
          } else {
            actionList = this.webSocketStoredActionList.filter(e => e.roomId === roomId)
          }

          ws.send(JSON.stringify({
            type: "syncUpdates",
            actionList
          }))

          break
        case 'clearActionList':
          this.webSocketStoredActionList = []
          this.rooms = []
          break
        default:
          console.log('unknown')
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  }

  setupWebSocketService(): Promise<void> {
    console.log("created WebSocketService")
    return
  }
}
