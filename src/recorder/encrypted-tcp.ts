import { StreamingSession } from '@ftr/contracts/regional-api'
import { createEncryptStream, generateKey } from '@ftr/contracts/shared/StreamEncryption'
import { inject, injectable } from 'inversify'
import { Socket } from 'net'
import { PassThrough } from 'stream'
import { Tcp } from "./tcp";
import { SYMBOLS } from "../modules/symbols";



@injectable()
export class EncryptedTcp {
  public terminationRequested = false

  public constructor(
    // @inject(SYMBOLS.Logger) private readonly logger: Logger,
    // @inject(SYMBOLS.Config) private readonly config: Config,
    // @inject(SYMBOLS.State) private readonly state: State,
    @inject(SYMBOLS.Tcp) private readonly tcp: Tcp,
  ) {}

  /**
   * Connects a TCP stream to the on-demand server. Returns a writable stream
   * that encrypts data with the provided encryption key, before piping it on
   * to the TCP connection
   */
  async connect(
    session: StreamingSession,
    errorHandler: (e: Error) => void,
  ): Promise<{
    tcpStream: Socket
    writableEncryptionStream: PassThrough
  }> {
    const encryptionKey = generateKey(this.config.secretKey, this.state.recorderId)
    const writableEncryptionStream = createEncryptStream(encryptionKey, {
      debug: (msg, args) => this.logger.debug(msg, args),
    })

    const url = new URL(session.publicUrl)
    const tcpStream = this.tcp.connect(url)

    // If we get any TCP errors, don't even try to recover from them. Just propagate the error back up to
    // the `main()` application loop and let streaming restart itself.
    tcpStream.on('error', errorHandler)

    /**
     * There are two situations in which end is called:
     *  1. When cleaning up the TCP connection because the stream has been signalled to terminate
     *  2. When the TCP connection is dropped during an active session. At the moment we have no way to successfully
     *     handle a reconnection (due to the ffmpeg receiver in the on-demand server), so we must terminate the session
     *     and have it be restarted
     */
    tcpStream.on('end', () => {
      if (this.terminationRequested) {
        this.logger.info('encrypted TCP connection closed')

        // Switch terminationRequested back to false as the existing TCP connection
        // has been cleanly closed
        this.terminationRequested = false
      } else {
        errorHandler(new Error('TCP connection closed unexpectedly'))
      }
    })

    writableEncryptionStream.pipe(tcpStream)
    return { tcpStream, writableEncryptionStream }
  }

  terminate(tcpStream?: Socket, writableEncryptionStream?: PassThrough): void {
    this.terminationRequested = true

    if (tcpStream && !tcpStream.destroyed) {
      tcpStream.end()
    }

    if (writableEncryptionStream && !writableEncryptionStream.destroyed) {
      writableEncryptionStream.end()
    }
  }
}
