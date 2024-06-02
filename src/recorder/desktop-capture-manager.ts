import { RtAudio, RtAudioApi, RtAudioDeviceInfo, RtAudioFormat } from "audify";
import { inject, injectable } from "inversify";
import { PassThrough } from "stream";


import { RtAudioDeviceHandler } from "./rt-audio-device-handler";
import { SYMBOLS } from "../modules/symbols";
import { InvalidArgumentError } from "commander";
import ffmpeg from "fluent-ffmpeg";
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



    const ffmpegCommand = ffmpeg();

    let command = ffmpegCommand
      .input("-i desktop")
      .inputFormat("-f gdigrab")
      .inputOptions([`-ar 48000`, `-ac 1`])
      .output(this.activeStream.outputStream, { end: true })
      .outputOptions([
        "-framerate 30",
        "-c:v libx264",
        "-preset veryfast",
        "-crf 28"
      ]);

    command
      .on("error", (error, _stdout, stderr) => {
        error.message = `Ffmpeg: Process threw an error ${error.message}`;
      })
      .on("stderr", output => {
        console.log(output);
      })
      .on("progress", progress => {
        console.log(progress);
      })
      .on("end", () => {

        console.log("Ffmpeg: processing finished");
      })
      .on("start", commandline => {
        console.log("Ffmpeg: processing started");
      })
      .run();

    this.activeStream.outputStream.on("data", (data) => {
      console.log("recorder capture")
      console.log(data)
    });


    const writeToDiskStream = createWriteStream("D:\\repo\\test.mkv");
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
