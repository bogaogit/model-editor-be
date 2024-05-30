//@ts-ignore
import { WebSocket } from "ws";
import {readFileSync} from "fs"
import { createServer } from "https";
//@ts-ignore
import { randomUUID } from "crypto";
import { RoomInfo, WebSocketActionStoreItem, WebSocketRequest } from "./WebSocket.model";

export class WebSocketService {
  private wss: WebSocket.Server;
  private webSocketStoredActionList: WebSocketActionStoreItem[] = [];
  private rooms: RoomInfo[] = [];
  private clients: any[] = [];

  constructor() {

  }

  getRoomById(id: string): RoomInfo | undefined {
    return this.rooms.find(e => e.id === id);
  }

  pushActionToList(webSocketRequest: WebSocketRequest): WebSocketActionStoreItem {
    const action: WebSocketActionStoreItem = {
      id: randomUUID(),
      roomId: webSocketRequest.roomId,
      webSocketAction: webSocketRequest.webSocketAction,
      userInfo: webSocketRequest.userInfo,
      createTime: new Date()
    };

    this.webSocketStoredActionList.push(action);
    return action;
  }

  setServerMessageHandlers(ws: any): void {
    console.log("New client connected");
    this.clients.push(ws);

    ws.on("message", (message: any) => {
      console.log("Client message:", message.toString());

      const webSocketRequest: WebSocketRequest = JSON.parse(message.toString() ?? "{}");

      const { roomId, currentActionId, roomInfo, joinRoomId, webSocketAction, userInfo } = webSocketRequest;

      switch (webSocketAction?.actionType) {
        case "createRoom": {
          const newRoom: RoomInfo = {
            id: randomUUID(),
            ...roomInfo!!,
            clients: [ws]
          };

          this.rooms.push(newRoom);

          ws.send(JSON.stringify({
            type: "createRoom",
            room: newRoom,
            userInfo: {
              userId: randomUUID(),
              userName: userInfo?.userName
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
                userName: userInfo?.userName
              },
              room,
              actionList: this.webSocketStoredActionList.filter(e => e.roomId === room.id)
            }));
          }
          break;
        }
        case "updateEntity": {
          this.pushActionToList(webSocketRequest);

          break;
        }
        case "updateEntityAndSync":
        case "sendMessage": {
          if (!webSocketRequest.roomId) return
          const updateEntityAndSyncAction = this.pushActionToList(webSocketRequest);
          const room = this.getRoomById(webSocketRequest.roomId);

          room?.clients.forEach(client => client.send(JSON.stringify({
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

  startWebSocketService() {
    if (!this.wss) {
      const httpsOptions = {
        key : readFileSync('./keys/key.pem'),
        cert : readFileSync('./keys/cert.pem')
      };

      const port = 8080;
      const httpsServer = createServer(httpsOptions);
      this.wss = new WebSocket.Server({ server: httpsServer });
      // this.wss = new WebSocket.Server({ port: 8080 });

      httpsServer.listen(port, () => {
        console.log(`WebSocket server is running on port ${port}`);
      })

      this.wss.on("connection", (ws: any) => {
        this.setServerMessageHandlers(ws);
      });

      return;
    } else {
      console.log("WebSocket Service already created.");
    }
  }

  getRooms(): RoomInfo[] {
    return this.rooms;
  }
}
