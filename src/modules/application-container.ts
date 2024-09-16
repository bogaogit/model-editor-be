
import { Container, interfaces } from "inversify";


import ServiceIdentifier = interfaces.ServiceIdentifier;
import { RecorderService } from "../recorder/Recorder.service";
import { OnDemandService } from "../on-demand-service/OnDemandService.service";
import { SYMBOLS } from "./symbols";
import { RtAudioDeviceHandler } from "../recorder/rt-audio-device-handler";
import { AudioManager } from "../recorder/audio-manager";
import { DesktopCaptureManager } from "../recorder/desktop-capture-manager";
import { LiveChatService } from "../live-chat/LiveChat.service";

export class ApplicationContainer {
  private readonly container = new Container()

  constructor() {
    this.container.bind<RecorderService>(SYMBOLS.RecorderService).to(RecorderService).inSingletonScope()
    this.container.bind<OnDemandService>(SYMBOLS.OnDemandService).to(OnDemandService).inSingletonScope()
    this.container.bind<LiveChatService>(SYMBOLS.LiveChatService).to(LiveChatService).inSingletonScope()
    this.container.bind<RtAudioDeviceHandler>(SYMBOLS.RtAudioDeviceHandler).to(RtAudioDeviceHandler).inSingletonScope()
    this.container.bind<AudioManager>(SYMBOLS.AudioManager).to(AudioManager).inSingletonScope()
    this.container.bind<DesktopCaptureManager>(SYMBOLS.DesktopCaptureManager).to(DesktopCaptureManager).inSingletonScope()
  }

  rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    return this.container.rebind<T>(serviceIdentifier)
  }

  get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier)
  }
}
