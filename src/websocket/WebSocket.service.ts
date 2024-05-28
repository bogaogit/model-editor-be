import "reflect-metadata";
import { inject, injectable } from "inversify";
import { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { RoomInfo, WebSocketActionStoreItem, WebSocketRequest } from "./WebSocket.model";

@injectable()
export class WebSocketService {
  private wss: WebSocket.Server;
  private webSocketStoredActionList = [];
  private rooms: RoomInfo[] = [];
  private clients = [];

  constructor() {

  }

  getRoomById(id: string): RoomInfo {
    return this.rooms.find(e => e.id === id);
  }

  pushActionToList(webSocketRequest: WebSocketRequest): WebSocketActionStoreItem {
    const action: WebSocketActionStoreItem = {
      id: randomUUID(),
      roomId: webSocketRequest.roomId,
      webSocketAction: webSocketRequest.webSocketAction,
      userInfo: webSocketRequest.userInfo
    };

    this.webSocketStoredActionList.push(action);
    return action
  }

  setServerMessageHandlers(ws: any): void {
    console.log("New client connected");
    this.clients.push(ws);

    ws.on("message", (message) => {
      console.log("Client message:", message.toString());

      const webSocketRequest: WebSocketRequest = JSON.parse(message.toString() ?? "{}");

      const { roomId, currentActionId, roomInfo, joinRoomId, webSocketAction, userInfo } = webSocketRequest;

      switch (webSocketAction?.actionType) {
        case "createRoom": {
          const newRoom: RoomInfo = {
            id: randomUUID(),
            ...roomInfo,
            clients: [ws]
          };

          this.rooms.push(newRoom);

          ws.send(JSON.stringify({
            type: "createRoom",
            room: newRoom,
            userInfo: {
              userId: randomUUID(),
              userName: randomUUID()
            }
          }));
          break;
        }
        case "getRoomList": {
          ws.send(JSON.stringify({
            type: "getRoomList",
            roomList: this.rooms
          }));
          break;
        }
        case "joinRoom": {
          let room;
          if (joinRoomId) {
            room = this.rooms.find(e => e.id === joinRoomId);
          }

          if (room) {
            room.clients.push(ws);
            ws.send(JSON.stringify({
              type: "joinRoom",
              userInfo: {
                userId: randomUUID(),
                userName: randomUUID()
              },
              room,
              actionList: this.webSocketStoredActionList.filter(e => e.roomId === room.id)
            }));
          }
          break;
        }
        case "updateEntity": {
          this.pushActionToList(webSocketRequest)

          break;
        }
        case "updateEntityAndSync":
        case "sendMessage":
        {
          const updateEntityAndSyncAction = this.pushActionToList(webSocketRequest)
          const room = this.getRoomById(webSocketRequest.roomId);

          room.clients.forEach(client => client.send(JSON.stringify({
            type: "syncLatestAction",
            actionList: [updateEntityAndSyncAction]
          })));

          break;
        }
        case "syncUpdates": {
          let actionList = [];
          if (!!currentActionId) {
            const webSocketStoredActionListForRoom = this.webSocketStoredActionList.filter(e => e.roomId === roomId);
            const index = webSocketStoredActionListForRoom.findIndex(e => e.id === currentActionId);
            actionList = webSocketStoredActionListForRoom.slice(index + 1, webSocketStoredActionListForRoom.length);
          } else {
            actionList = this.webSocketStoredActionList.filter(e => e.roomId === roomId);
          }

          ws.send(JSON.stringify({
            type: "syncUpdates",
            actionList
          }));

          break;
        }
        case "clearActionList": {
          this.webSocketStoredActionList = [];
          this.rooms = [];
          break;
        }
        default:
          console.log("unknown");
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  }

  startWebSocketService(): Promise<void> {
    if (!this.wss) {
      this.wss = new WebSocket.Server({ port: 8080 });
      this.wss.on("connection", (ws) => {
        this.setServerMessageHandlers(ws);
      });

      console.log("Created WebSocket Service");
      return;
    } else {
      console.log("WebSocket Service already created.");
    }
  }

  getRooms(): RoomInfo[] {
    return this.rooms;
  }
}
