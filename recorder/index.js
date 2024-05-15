const { Readable } = require('stream');
const net = require('net');

// Replace with the IP address or hostname of the TCP service
const host = 'localhost';

// Replace with the port number of the TCP service
const port = 7070;

// Function to generate some data to send (replace with your actual data source)
function generateData() {
  // Simulate some data generation (replace with your logic)
  return Math.random().toString();
}

// Create a custom Readable stream to simulate data stream
class MyDataStream extends Readable {
  constructor(options) {
    super(options);
  }

  _read() {
    const data = generateData();
    if (data) {
      this.push(data);
    } else {
      this.push(null); // Signal end of stream
    }
  }
}

// Create a data stream instance
const dataStream = new MyDataStream();

// Create a TCP socket connection
const socket = net.createConnection({ host, port });

// Pipe the data stream to the socket
dataStream.pipe(socket);

// Handle errors on the socket
socket.on('error', (err) => {
  console.error('Socket error:', err);
});

// Handle successful connection
socket.on('connect', () => {
  console.log('Successfully connected to TCP service');
});

socket.on('data', (data) => {
  console.log('received data:' + data);
});

// Optionally close the connection after some time (replace with your logic)
setTimeout(() => {
  socket.end();
}, 50000); // Close after 5 seconds
