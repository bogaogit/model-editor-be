
const { Transform, Writable, PassThrough } = require('stream');
const net = require('net');
const { RtAudio, RtAudioFormat } = require("audify");

const rtAudio = new RtAudio(/* Insert here specific API if needed */);


// Replace with the IP address or hostname of the TCP service
const host = 'localhost';

// Replace with the port number of the TCP service
const port = 7070;

// Function to create a custom stream that simulates audio data (optional)
const MyAudioStream = function () {
  Transform.call(this);
};

MyAudioStream.prototype = Object.create(Transform.prototype, {
  _transform: {
    value: function (chunk, encoding, callback) {
      // Simulate audio data generation here (replace with your audio source)
      const audioData = generateAudioData(chunk.length); // Replace with audio generation logic
      this.push(audioData);
      callback();
    }
  }
});

// Replace this with your function to generate audio data chunks
function generateAudioData(length) {
  // Implement your logic to generate raw audio data of the specified length
  // This is a placeholder for your audio source
  const data = new Buffer.alloc(length).fill(' '); // Replace with actual audio data generation
  return data;
}

const inputs = rtAudio.getDefaultInputDevice()
const outputs = rtAudio.getDefaultOutputDevice()

const passThrough = new PassThrough()
passThrough.resume()

rtAudio.openStream(
  {
    deviceId: outputs, // Output device id (Get all devices using `getDevices`)
    nChannels: 1, // Number of channels
    firstChannel: 0, // First channel index on device (default = 0).
  },
  {
    deviceId: inputs, // Input device id (Get all devices using `getDevices`)
    nChannels: 1, // Number of channels
    firstChannel: 0, // First channel index on device (default = 0).
  },
  RtAudioFormat.RTAUDIO_SINT16, // PCM Format - Signed 16-bit integer
  48000, // Sampling rate is 48kHz
  1920, // Frame size is 1920 (40ms)
  "MyStream", // The name of the stream (used for JACK Api)
  (pcm) => {
    // console.log(pcm)
    passThrough.write(pcm)
  } // Input callback function, write every input pcm data to the output buffer
);



rtAudio.start()

// Create a TCP socket connection
const socket = net.createConnection({ host, port });

passThrough.pipe(socket)

// Create our custom audio stream (optional for simulated data)
const audioStream = new MyAudioStream();

// Pipe the audio stream (or directly audify if no transformation) through to the socket
// (audioStream || audio).pipe(socket);

// Handle errors on the socket
socket.on('error', (err) => {
  console.error('Socket error:', err);
});

// Handle successful connection
socket.on('connect', () => {
  console.log('Successfully connected to TCP service');
});

socket.on('data', (data) => {
  console.log("data from service")
  if (data){
    rtAudio.write(data)
  }

});

// Close the socket and audio stream when finished
// ... (add logic to close the connection when you're done sending data)

// Stop generating audio data (if applicable)
// ... (add logic to stop your audio generation)

// socket.end();
// audio.end(); // or audioStream.end() if you used it
