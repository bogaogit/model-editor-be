"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket_service_1 = require("./websocket/WebSocket.service");
const webSocketService = new WebSocket_service_1.WebSocketService();
webSocketService.startWebSocketService();
