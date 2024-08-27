import { inject, injectable } from 'inversify'
import { Socket, connect } from 'net'
// import { Logger } from '../../shared/utils'
// import { SYMBOLS } from "../modules/symbols";

@injectable()
export class Tcp {
  public constructor(
    // @inject(SYMBOLS.Logger) private readonly logger: Logger
  ) {}

  connect(url: URL): Socket {
    const connection = connect(parseInt(url.port, 10), url.hostname, () => {
      // this.logger.info('TCP Connected', { url })
    })

    connection.setKeepAlive(true)
    return connection
  }
}
