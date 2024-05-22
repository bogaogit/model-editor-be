
import { Container, interfaces } from "inversify";
import { SYMBOLS } from "./symbols";

import { WebSocketService } from "../websocket/WebSocket.service";
import ServiceIdentifier = interfaces.ServiceIdentifier;

export class ApplicationContainer {
  private readonly container = new Container()

  constructor() {
    this.container.bind<WebSocketService>(SYMBOLS.WebSocketService).to(WebSocketService).inSingletonScope()
  }

  rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    return this.container.rebind<T>(serviceIdentifier)
  }

  get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier)
  }
}
