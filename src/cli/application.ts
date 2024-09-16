import { ApplicationContainer } from "../modules/application-container";
import { RecorderService } from "../recorder/Recorder.service";
import { OnDemandService } from "../on-demand-service/OnDemandService.service";
import { SYMBOLS } from "../modules/symbols";
import { LiveChatService } from "../live-chat/LiveChat.service";

interface ApplicationContainers {
  recorderService: RecorderService;
  onDemandService: OnDemandService;
  liveChatService: LiveChatService;
}

export async function configureApplicationForCli(): Promise<ApplicationContainers> {
  const container = new ApplicationContainer();
  const recorderService = container.get<RecorderService>(SYMBOLS.RecorderService);
  const onDemandService = container.get<OnDemandService>(SYMBOLS.OnDemandService);
  const liveChatService = container.get<LiveChatService>(SYMBOLS.LiveChatService);

  return {
    recorderService,
    onDemandService,
    liveChatService
  };
}
