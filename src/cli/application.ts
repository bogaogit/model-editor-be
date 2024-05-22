import { ApplicationContainer } from "./application-container";
import { SYMBOLS } from "./symbols";
import { WebSocketService } from "../websocket/WebSocket.service";

interface ApplicationContainers {
  webSocketService: WebSocketService;
}

export async function configureApplicationForCli(): Promise<ApplicationContainers> {
  const container = new ApplicationContainer();
  const webSocketService = container.get<WebSocketService>(SYMBOLS.WebSocketService);

  return {
    webSocketService,
  };
}
