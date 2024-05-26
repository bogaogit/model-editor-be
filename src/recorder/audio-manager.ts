import { RtAudio, RtAudioApi, RtAudioDeviceInfo } from "audify";
import { inject, injectable } from "inversify";
import { PassThrough } from "stream";


import { RtAudioDeviceHandler } from "./rt-audio-device-handler";
import { SYMBOLS } from "../modules/symbols";
import { InvalidArgumentError } from "commander";

export interface AudioDeviceWithState extends Partial<AudioDevice> {
  state: AudioDeviceState | undefined;
}

export interface AudioManagerStatusReport {
  state: AudioManagerState;
  selectedDevice: AudioDeviceWithState;
  rtAudio: {
    streamOpen: boolean | undefined
    steamRunning: boolean | undefined
    streamRunTime: number | undefined
    volume: number | undefined
    streamLatency: number | undefined
    sampleRate: number | undefined
  };
}

export enum AudioManagerState {
  Running = "running",
  DeviceUnavailable = "device-unavailable",
  NoDevice = "no-device",
  Ready = "ready",
}

export declare class AudioDevice {
  /**
   * The name of the audio device
   */
  name: string;
  /**
   * The number of the inputs on the device
   */
  inputs: number;
  /**
   * The number of the outputs on the device
   */
  outputs: number;
  /**
   * The AudioHost the device is running against on the operating system
   */
  host: AudioHost;
}

export declare enum AudioHost {
  Unspecified = "UNSPECIFIED",
  LinuxAlsa = "LINUX_ALSA",
  LinuxPulse = "LINUX_PULSE",
  LinuxOss = "LINUX_OSS",
  UnixJack = "UNIX_JACK",
  MacosxCore = "MACOSX_CORE",
  WindowsWasapi = "WINDOWS_WASAPI",
  WindowsAsio = "WINDOWS_ASIO",
  WindowsDs = "WINDOWS_DS",
  RtAudioDummy = "RTAUDIO_DUMMY"
}


export interface ActiveAudioStream {
  audioDevice: AudioDevice;
  activeRtAudio: RtAudio;
  activeRtAudioInfo: RtAudioDeviceInfo;
  host: RtAudioApi;
  outputStream: PassThrough;
}

export declare enum AudioDeviceState {
  Available = "Available",
  Unavailable = "Unavailable",
  Duplicate = "Duplicate"
}


/**
 * Setup to allow multiple subscriptions to the same audio device.
 *
 *
 */
@injectable()
export class AudioManager {
  private _availableAudioDevices: AudioDevice[] | undefined;
  selectedAudioDeviceState: AudioDeviceState | undefined;
  selectedAudioDevice: AudioDevice | undefined;

  /**
   * Only public for testing
   */
  activeStream: ActiveAudioStream | undefined;

  constructor(
    @inject(SYMBOLS.RtAudioDeviceHandler) private readonly rtAudioDeviceHandler: RtAudioDeviceHandler
  ) {
  }

  start(): void {
    const passThrough = new PassThrough();
    passThrough.on("error", this.handleError.bind(this));
    // Force the stream into flowing mode
    passThrough.resume();

    const rtAudio = new RtAudio();
    const defaultOutputDevice = rtAudio.getDefaultOutputDevice();
    const deviceId = defaultOutputDevice;
    const deviceInfo = rtAudio.getDevices().find(x => x.id === deviceId);
    if (deviceInfo === undefined) {
      throw new InvalidArgumentError(`${deviceId} is not a valid output id`);
    }

    if (deviceInfo.outputChannels === 0) {
      throw new InvalidArgumentError(`${deviceId} does not have any audio outputs`);
    }

    this.rtAudioDeviceHandler.capture(rtAudio, deviceId, deviceInfo, passThrough, this.handleError.bind(this));

    this.activeStream = {
      audioDevice: this.selectedAudioDevice!,
      host: deviceId,
      outputStream: passThrough,
      activeRtAudio: rtAudio,
      activeRtAudioInfo: deviceInfo
    };

    console.log("capture output stream started.")
  }

  handleError(err: Error, stdout?: string, stderr?: string): void {
    this.terminate();
  }

  terminate(): void {
    this.rtAudioDeviceHandler.terminate(this.activeStream!.activeRtAudio);
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
