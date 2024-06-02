import { inject, injectable } from "inversify";
import { PassThrough } from "stream";
import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";

import { RtAudioDeviceHandler } from "./rt-audio-device-handler";
import { SYMBOLS } from "../modules/symbols";

import { createWriteStream } from "fs";

export interface ActiveVideoStream {
  outputStream: PassThrough;
}

/**
 * Setup to allow multiple subscriptions to the same audio device.
 *
 *
 */
@injectable()
export class DesktopCaptureManager {
  activeStream: ActiveVideoStream | undefined;

  constructor(
    @inject(SYMBOLS.RtAudioDeviceHandler) private readonly rtAudioDeviceHandler: RtAudioDeviceHandler
  ) {
  }

  start(): void {
    const passThrough = new PassThrough();
    passThrough.on("error", this.handleError.bind(this));
    // Force the stream into flowing mode
    passThrough.resume();
    this.activeStream = {
      outputStream: passThrough,
    };



    const process = spawn(
      ffmpeg,
      ["-probesize", "10M", "-f", "gdigrab", "-framerate", "60", "-i", "desktop", "-f", "flv", "-"],
      { stdio: "pipe" }
    );
    const stream = process.stdout;
    stream.pipe(this.activeStream.outputStream)


    this.activeStream.outputStream.on("data", (data) => {

    });


    const writeToDiskStream = createWriteStream("D:\\repo\\test.flv");
    writeToDiskStream.on("error", this.handleFailure.bind(this));

    this.activeStream.outputStream.pipe(writeToDiskStream);
  }

  handleFailure(err: Error, stdout?: string, stderr?: string): void {
    console.log(err)
  }

  handleError(err: Error, stdout?: string, stderr?: string): void {
    this.terminate();
  }

  terminate(): void {
    // this.rtAudioDeviceHandler.terminate(this.activeStream!.activeRtAudio);
    this.activeStream?.outputStream.end();
    this.activeStream = undefined;
    return;
  }

  /**
   * Creates a unique pass-through stream that can be subscribed to, which will be piped audio from the active RtAudio
   * stream
   */
  subscribe(): PassThrough {
    const passThrough = new PassThrough({ emitClose: true });
    this.activeStream?.outputStream?.pipe(passThrough);
    passThrough.on("error", this.handleError.bind(this));
    return passThrough;
  }
}
