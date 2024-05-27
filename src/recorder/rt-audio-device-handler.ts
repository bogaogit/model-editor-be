import { RtAudio, RtAudioDeviceInfo, RtAudioErrorType, RtAudioFormat, RtAudioStreamFlags } from "audify";
import { injectable } from "inversify";
import { Readable, Writable } from "stream";
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
  ): Promise<void> {
    const rtAudio = new RtAudio();
    const defaultOutputDevice = rtAudio.getDefaultOutputDevice();
    const outputDevice = rtAudio.getDevices().find(x => x.id === defaultOutputDevice);

    if (outputDevice === undefined) {
      throw new InvalidArgumentError(`${defaultOutputDevice} is not a valid output id`);
    }

    if (outputDevice.outputChannels === 0) {
      throw new InvalidArgumentError(`${defaultOutputDevice} does not have any audio outputs`);
    }

    const outputChannels = 1

    try {
      // Open the input/output stream
      rtAudio.openStream(
        {
          deviceId: outputDevice.id,
          nChannels: outputChannels
        },
        null,
        RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
        outputDevice.preferredSampleRate, // Sampling rate is the preferred rate, or the value closest 48kHz
        DEFAULT_FRAME_SIZE,
        "Output Stream", // The name of the stream (used for JACK Api)
        null,
        null,
        RtAudioStreamFlags.RTAUDIO_SCHEDULE_REALTIME,
        this.getRtAudioErrorMapper(handleError)
      );

      // Start the stream
      rtAudio.start();

      const bufferSize = BYTES_PER_PCM_SAMPLE * DEFAULT_FRAME_SIZE * outputChannels;
      const bufferer = new ByteBufferer(bufferSize);

      for await (const chunk of input) {
        const buffers = bufferer.write(chunk);
        for (const buffer of buffers) {
          rtAudio.write(buffer);
        }
      }
    } catch (error) {
      this.logger.error("Failed to start RtAudio device output", {
        deviceId: defaultOutputDevice,
        device: outputDevice,
        error
      });

      return handleError(new Error("RtAudio: Failed to start"));
    }
  }

  capture(
    output: Writable,
    handleError: (err: Error, stdout?: string, stderr?: string) => void
  ): void {
    const rtAudio = new RtAudio();

    const defaultInputDevice = rtAudio.getDefaultInputDevice();
    const inputDevice = rtAudio.getDevices().find(x => x.id === defaultInputDevice);

    if (inputDevice === undefined) {
      throw new InvalidArgumentError(`${defaultInputDevice} is not a valid output id`);
    }

    if (inputDevice.inputChannels === 0) {
      throw new InvalidArgumentError(`${defaultInputDevice} does not have any audio outputs`);
    }

    try {
      rtAudio.openStream(
        null,
        {
          deviceId: inputDevice.id,
          nChannels: inputDevice.inputChannels,
          firstChannel: 0
        },
        RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
        inputDevice.preferredSampleRate, // Sampling rate is 48kHz
        DEFAULT_FRAME_SIZE, // Frame size is 1920 (40ms)
        "Input Stream", // The name of the stream (used for JACK Api)
        (pcm) => {
          output.write(pcm);
        },
        () => {
        }
      );

      rtAudio.start();
    } catch (error) {
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
