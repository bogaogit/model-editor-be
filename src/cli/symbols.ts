import { WebSocketService } from "../websocket/WebSocket.service";
import { OnDemandService } from "../on-demand-service/OnDemandService.service";

export const SYMBOLS = {
  WebSocketService: Symbol.for('WebSocketService'),
  RecorderService: Symbol.for('RecorderService'),
  OnDemandService: Symbol.for('OnDemandService'),
}
