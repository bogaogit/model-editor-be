import { RtAudio, RtAudioApi, RtAudioDeviceInfo, RtAudioErrorType, RtAudioFormat, RtAudioStreamFlags } from "audify";
import { inject, injectable } from "inversify";
import { PassThrough, Readable, Writable } from "stream";
import { ByteBufferer } from "./byte-bufferer";
import { Logger } from "@nestjs/common";
import { InvalidArgumentError } from "commander";

// Number of samples per frame, essentially how much buffering the audio driver is doing
// The buffer is approximately 0.01s
export const DEFAULT_FRAME_SIZE = 512;

export const BYTES_PER_PCM_SAMPLE = 2;

export const SAMPLE_RATE_48K = 48_000;

@injectable()
export class RtAudioDeviceHandler {
  private readonly logger = new Logger(RtAudioDeviceHandler.name);

  public constructor() {
  }

  async output(
    input: Readable,
    handleError: (err: Error, stdout?: string, stderr?: string) => void,
    sampleRate: number = SAMPLE_RATE_48K,
    frameSize: number = DEFAULT_FRAME_SIZE
  ): Promise<void> {
    const outputChannels = 1
    const rtAudio = new RtAudio();
    const defaultOutputDevice = rtAudio.getDefaultOutputDevice();
    const deviceId = defaultOutputDevice;
    const device = rtAudio.getDevices().find(x => x.id === deviceId);
    if (device === undefined) {
      throw new InvalidArgumentError(`${deviceId} is not a valid output id`);
    }

    if (device.outputChannels === 0) {
      throw new InvalidArgumentError(`${deviceId} does not have any audio outputs`);
    }


    try {
      // Open the input/output stream
      rtAudio.openStream(
        {
          deviceId: device.id,
          nChannels: outputChannels
        },
        null,
        RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
        sampleRate ?? device.preferredSampleRate, // Sampling rate is the preferred rate, or the value closest 48kHz
        frameSize,
        "FTR Output Stream", // The name of the stream (used for JACK Api)
        null,
        null,
        RtAudioStreamFlags.RTAUDIO_SCHEDULE_REALTIME,
        this.getRtAudioErrorMapper(handleError)
      );

      // Start the stream
      rtAudio.start();

      const bufferSize = BYTES_PER_PCM_SAMPLE * DEFAULT_FRAME_SIZE * outputChannels;
      const bufferer = new ByteBufferer(bufferSize);


      const buffers = [];

// node.js readable streams implement the async iterator protocol
//       for await (const data of input) {
//         // console.log(data)
//         buffers.push(data);
//       }

      // const finalBuffer = Buffer.concat(buffers);

      // rtAudio.write(finalBuffer);
      for await (const chunk of input) {
        const buffers = bufferer.write(chunk);
        for (const buffer of buffers) {
          rtAudio.write(buffer);
        }
      }
    } catch (error) {
      this.logger.error("Failed to start RtAudio device output", {
        deviceId,
        device,
        error
      });

      return handleError(new Error("RtAudio: Failed to start"));
    }
  }

  capture(
    rtAudio: RtAudio,
    host: RtAudioApi,
    device: RtAudioDeviceInfo,
    output: Writable,
    handleError: (err: Error, stdout?: string, stderr?: string) => void
  ): void {
    // this.logger.info('Starting Audify Stream', {
    //   host,
    //   device,
    // })

    // Ensure the target device is still available on the RtAudio instance
    const audioDeviceId = this.getAudioDeviceId(rtAudio, device);
    if (audioDeviceId === undefined) {
      return handleError(new Error("Target audio device not available"));
    }


    const sampleRate = device.preferredSampleRate
      ? device.preferredSampleRate
      : this.getDeviceSampleRateClosestToTarget(device.sampleRates);

    // RtAudio write method requires a fixed size buffer calculate via the following
    // frame_size * no_of_output_channels * size_of_sample_in_bytes.

    try {
      // Open the input/output stream
      const inputs = rtAudio.getDefaultInputDevice();
      const outputs = rtAudio.getDefaultOutputDevice();

      rtAudio.openStream(
        {
          deviceId: outputs, // Output device id (Get all devices using `getDevices`)
          nChannels: 1, // Number of channels
          firstChannel: 0 // First channel index on device (default = 0).
        },
        {
          deviceId: inputs, // Input device id (Get all devices using `getDevices`)
          nChannels: 1, // Number of channels
          firstChannel: 0 // First channel index on device (default = 0).
        },
        RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
        48000, // Sampling rate is 48kHz
        1920, // Frame size is 1920 (40ms)
        "MyStream", // The name of the stream (used for JACK Api)
        (pcm) => {
          output.write(pcm);
        },
        () => {
        }
      );

      // Start the stream
      rtAudio.start();

      // this.logger.info('Started Audify Stream', {
      //   host,
      //   device,
      // })
    } catch (error) {
      this.logger.error("Failed to start RtAudio device capture", {
        host,
        device,
        error
      });

      return handleError(new Error("RtAudio: Failed to start"));
    }
  }

  private getRtAudioErrorMapper(
    handleError: (err: Error, stdout?: string, stderr?: string) => void
  ): (code: RtAudioErrorType, message: string) => void {
    return (code: RtAudioErrorType, message: string) => {
      switch (code) {
        case RtAudioErrorType.WARNING:
          this.logger.warn("RtAudio: warning", message);
          return;
        case RtAudioErrorType.DEBUG_WARNING:
          this.logger.warn("RtAudio: debug warning", message);
          return;
        case RtAudioErrorType.UNSPECIFIED:
          return handleError(new Error(`RtAudio: unspecified error, ${message}`));
        case RtAudioErrorType.NO_DEVICES_FOUND:
          return handleError(new Error(`RtAudio: no devices found, ${message}`));
        case RtAudioErrorType.INVALID_DEVICE:
          return handleError(new Error(`RtAudio: invalid device, ${message}`));
        case RtAudioErrorType.MEMORY_ERROR:
          return handleError(new Error(`RtAudio: memory error, ${message}`));
        case RtAudioErrorType.INVALID_PARAMETER:
          return handleError(new Error(`RtAudio: invalid parameter, ${message}`));
        case RtAudioErrorType.INVALID_USE:
          return handleError(new Error(`RtAudio: invalid use, ${message}`));
        case RtAudioErrorType.DRIVER_ERROR:
          return handleError(new Error(`RtAudio: driver error, ${message}`));
        case RtAudioErrorType.SYSTEM_ERROR:
          return handleError(new Error(`RtAudio: system error, ${message}`));
        case RtAudioErrorType.THREAD_ERROR:
          return handleError(new Error(`RtAudio: thread error, ${message}`));
        default:
          return handleError(new Error(`RtAudio: unknown error, ${message}`));
      }
    };
  }

  terminate(rtAudio: RtAudio): void {
    // this.logger.info('Terminating RtAudio handling')
    if (rtAudio.isStreamOpen()) {
      rtAudio.closeStream();
    }
  }

  private getAudioDeviceId(rtAudio: RtAudio, device: RtAudioDeviceInfo): number | undefined {
    const devices = rtAudio.getDevices();
    return devices.find(device => device.name === device.name && device.inputChannels === device.inputChannels)
      ?.id;
  }

  private getDeviceSampleRateClosestToTarget(sampleRates: number[]): number {
    if (!sampleRates.length) {
      this.logger.warn("No sample rates reported for audio device, setting sample rate to 48kHz, this may cause issues");
      return SAMPLE_RATE_48K;
    }
    return getSupportedSampleRateClosestTo48khz(sampleRates);
  }
}

function getSupportedSampleRateClosestTo48khz(sampleRates: number[]): number {
  const target = SAMPLE_RATE_48K;
  return sampleRates.reduce((prev, curr) => {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });
}
