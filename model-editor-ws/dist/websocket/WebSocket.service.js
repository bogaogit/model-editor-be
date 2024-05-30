"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
//@ts-ignore
const ws_1 = require("ws");
//@ts-ignore
const crypto_1 = require("crypto");
class WebSocketService {
    constructor() {
        this.webSocketStoredActionList = [];
        this.rooms = [];
        this.clients = [];
    }
    getRoomById(id) {
        return this.rooms.find(e => e.id === id);
    }
    pushActionToList(webSocketRequest) {
        const action = {
            id: (0, crypto_1.randomUUID)(),
            roomId: webSocketRequest.roomId,
            webSocketAction: webSocketRequest.webSocketAction,
            userInfo: webSocketRequest.userInfo,
            createTime: new Date()
        };
        this.webSocketStoredActionList.push(action);
        return action;
    }
    setServerMessageHandlers(ws) {
        console.log("New client connected");
        this.clients.push(ws);
        ws.on("message", (message) => {
            var _a;
            console.log("Client message:", message.toString());
            const webSocketRequest = JSON.parse((_a = message.toString()) !== null && _a !== void 0 ? _a : "{}");
            const { roomId, currentActionId, roomInfo, joinRoomId, webSocketAction, userInfo } = webSocketRequest;
            switch (webSocketAction === null || webSocketAction === void 0 ? void 0 : webSocketAction.actionType) {
                case "createRoom": {
                    const newRoom = Object.assign(Object.assign({ id: (0, crypto_1.randomUUID)() }, roomInfo), { clients: [ws] });
                    this.rooms.push(newRoom);
                    ws.send(JSON.stringify({
                        type: "createRoom",
                        room: newRoom,
                        userInfo: {
                            userId: (0, crypto_1.randomUUID)(),
                            userName: userInfo === null || userInfo === void 0 ? void 0 : userInfo.userName
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
                                userId: (0, crypto_1.randomUUID)(),
                                userName: userInfo === null || userInfo === void 0 ? void 0 : userInfo.userName
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
                    if (!webSocketRequest.roomId)
                        return;
                    const updateEntityAndSyncAction = this.pushActionToList(webSocketRequest);
                    const room = this.getRoomById(webSocketRequest.roomId);
                    room === null || room === void 0 ? void 0 : room.clients.forEach(client => client.send(JSON.stringify({
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
                    }
                    else {
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
            this.wss = new ws_1.WebSocket.Server({ port: 8080 });
            this.wss.on("connection", (ws) => {
                this.setServerMessageHandlers(ws);
            });
            console.log("Running webSocket service at port: 8080");
            return;
        }
        else {
            console.log("WebSocket Service already created.");
        }
    }
    getRooms() {
        return this.rooms;
    }
}
exports.WebSocketService = WebSocketService;
