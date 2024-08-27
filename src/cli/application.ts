import { ApplicationContainer } from "../modules/application-container";

import { WebSocketService } from "../websocket/WebSocket.service";
import { RecorderService } from "../recorder/Recorder.service";
import { OnDemandService } from "../on-demand-service/OnDemandService.service";
import { SYMBOLS } from "../modules/symbols";
import { LiveChatService } from "../live-chat/LiveChat.service";

interface ApplicationContainers {
  webSocketService: WebSocketService;
  recorderService: RecorderService;
  onDemandService: OnDemandService;
  liveChatService: LiveChatService;
}

export async function configureApplicationForCli(): Promise<ApplicationContainers> {
  const container = new ApplicationContainer();
  const webSocketService = container.get<WebSocketService>(SYMBOLS.WebSocketService);
  const recorderService = container.get<RecorderService>(SYMBOLS.RecorderService);
  const onDemandService = container.get<OnDemandService>(SYMBOLS.OnDemandService);
  const liveChatService = container.get<LiveChatService>(SYMBOLS.LiveChatService);

  return {
    webSocketService,
    recorderService,
    onDemandService,
    liveChatService
  };
}
