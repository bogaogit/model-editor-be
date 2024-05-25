import { ApplicationContainer } from "../modules/application-container";

import { WebSocketService } from "../websocket/WebSocket.service";
import { RecorderService } from "../recorder/Recorder.service";
import { OnDemandService } from "../on-demand-service/OnDemandService.service";
import { SYMBOLS } from "../modules/symbols";

interface ApplicationContainers {
  webSocketService: WebSocketService;
  recorderService: RecorderService;
  onDemandService: OnDemandService;
}

export async function configureApplicationForCli(): Promise<ApplicationContainers> {
  const container = new ApplicationContainer();
  const webSocketService = container.get<WebSocketService>(SYMBOLS.WebSocketService);
  const recorderService = container.get<RecorderService>(SYMBOLS.RecorderService);
  const onDemandService = container.get<OnDemandService>(SYMBOLS.OnDemandService);

  return {
    webSocketService,
    recorderService,
    onDemandService
  };
}
