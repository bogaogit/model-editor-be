import { PassThrough } from "stream";
import net from "net";
import { RtAudio, RtAudioFormat } from "audify";
import { injectable } from "inversify";

// Replace with the IP address or hostname of the TCP service
const host = "localhost";

// Replace with the port number of the TCP service
const port = 7070;

@injectable()
export class RecorderService {
  private rtAudio = new RtAudio(/* Insert here specific API if needed */);


  constructor() {

  }

  startStream() {
    const inputs = this.rtAudio.getDefaultInputDevice();
    const outputs = this.rtAudio.getDefaultOutputDevice();

    const passThrough = new PassThrough();
    passThrough.resume();

    this.rtAudio.openStream(
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
        // console.log(pcm)
        passThrough.write(pcm);
      },
      () => {
      }
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

    socket.on("data", (data) => {
      if (data) {
        this.rtAudio.write(data);
      }
    });
  }
}
