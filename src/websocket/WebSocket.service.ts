import "reflect-metadata";
import { inject, injectable } from 'inversify'

@injectable()
export class WebSocketService {
  constructor(

  ) {
  }

  setupWebSocketService(): Promise<void> {
    console.log("setupWebSocketService !!!")
    return
  }
}
