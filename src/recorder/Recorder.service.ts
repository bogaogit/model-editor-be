import { PassThrough, Writable } from "stream";
import net from "net";
import { RtAudio, RtAudioFormat } from "audify";
import { inject, injectable } from "inversify";
import { ApplicationModelsService } from "../services/ApplicationModel.service";
import { RtAudioDeviceHandler } from "./rt-audio-device-handler";
import { SYMBOLS } from "../modules/symbols";
import { AudioManager } from "./audio-manager";
import ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";

// Replace with the IP address or hostname of the TCP service
const host = "localhost";

// Replace with the port number of the TCP service
const port = 7070;

@injectable()
export class RecorderService {
  private rtAudio = new RtAudio();
  audioStream: PassThrough | undefined

  constructor(
    @inject(SYMBOLS.RtAudioDeviceHandler) private readonly rtAudioDeviceHandler: RtAudioDeviceHandler,
    @inject(SYMBOLS.AudioManager) private readonly audioManager: AudioManager,
  ) {

  }

  async startStream() {
    this.audioManager.start()

    this.audioStream = this.audioManager.subscribe()
const outputStream = new PassThrough();


    const ffmpegCommand = ffmpeg(this.audioStream)

    let command = ffmpegCommand
      .inputFormat('s16le') // PCM Signed 16 bit little endian.
      .inputOptions([`-ar 48000`, `-ac 1`])
      .output(outputStream, { end: true })
      .outputOptions([
        `-ac 1`,
        '-c:a libopus',
        '-mapping_family 255',
        '-muxdelay 0',
        '-f matroska',
      ])

    command
      .on('error', (error, _stdout, stderr) => {
        error.message = `Ffmpeg: Process threw an error ${error.message}`
      })
      .on('stderr', output => {
        console.log(output)
      })
      .on('progress', progress => {
        console.log(progress)
      })
      .on('end', () => {

        console.log('Ffmpeg: processing finished')
      })
      .on('start', commandline => {
        console.log('Ffmpeg: processing started')
      })
      .run()

    this.audioStream.on("data", (data) => {
      // console.log("recorder data")
      // console.log(data)
    })


    const writeToDiskStream = createWriteStream("D:\\repo\\test.mkv")
    writeToDiskStream.on('error', this.handleFailure.bind(this))

    outputStream.pipe(writeToDiskStream)

    const socket = net.createConnection({ host, port });

    outputStream.pipe(socket);




    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("connect", () => {
      console.log("Successfully connected to TCP service");
    });

    const passthrough = new PassThrough()

    socket.on("data", (data) => {
      if (data) {
        passthrough.push(data)
        // this.rtAudio.write(data)
      }
    });






    const ffmpegCommandPcm = ffmpeg(passthrough)
    const outputStreamPcm = new PassThrough();

    let commandPcm = ffmpegCommandPcm
      .inputOptions(['-re', '-guess_layout_max 0'])
      .output(outputStreamPcm, { end: true })
      .outputOptions(['-map 0:a', '-f s16le', '-acodec pcm_s16le', `-ac 1`, `-ar 48000`])

    commandPcm
      .on('error', (error, _stdout, stderr) => {
        error.message = `Ffmpeg: Process threw an error ${error.message}`
      })
      .on('stderr', output => {
        console.log(output)
      })
      .on('progress', progress => {
        console.log(progress)
      })
      .on('end', () => {

        console.log('Ffmpeg: processing finished')
      })
      .on('start', commandline => {
        console.log('Ffmpeg: processing started')
      })
      .run()

    await this.rtAudioDeviceHandler.output(
      outputStreamPcm,
      (err: Error, stdout?: string, stderr?: string) => {
        console.error('RTAudio output broke, son', { err, stderr, stdout })
      });

  }

  handleFailure(err: Error, stdout?: string, stderr?: string): void {
    console.log(err)
  }

  async startStream2() {
    const inputs = this.rtAudio.getDefaultInputDevice();
    const outputs = this.rtAudio.getDefaultOutputDevice();

    const passThrough = new PassThrough();
    passThrough.resume();

    this.rtAudio.openStream(
      {
        deviceId: outputs, // Output device id (Get all devices using `getDevices`)
        nChannels: 2, // Number of channels
        firstChannel: 0 // First channel index on device (default = 0).
      },
      {
        deviceId: inputs, // Input device id (Get all devices using `getDevices`)
        nChannels: 2, // Number of channels
        firstChannel: 0 // First channel index on device (default = 0).
      },
      RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
      48000, // Sampling rate is 48kHz
      512, // Frame size is 1920 (40ms)
      "MyStream", // The name of the stream (used for JACK Api)
      (pcm) => {
        passThrough.write(pcm);
      },
      () => {
      },
    );


    this.rtAudio.start();


// Create a TCP socket connection
    const socket = net.createConnection({ host, port });

    passThrough.pipe(socket);

// Handle errors on the socket
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

// Handle successful connection
    socket.on("connect", () => {
      console.log("Successfully connected to TCP service");
    });

    const passthrough = new PassThrough()

    socket.on("data", (data) => {
      if (data) {
        passthrough.push(data)
        // this.rtAudio.write(data)
      }
    });

    await this.rtAudioDeviceHandler.output(
      passthrough,
      (err: Error, stdout?: string, stderr?: string) => {
        console.error('RTAudio output broke, son', { err, stderr, stdout })
      });
  }
}
