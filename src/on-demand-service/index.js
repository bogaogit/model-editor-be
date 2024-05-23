const net = require('net');

// Define the port number for your service
const port = 7070;
const host = "localhost";

// Create a TCP server using net.createServer()
const server = net.createServer((socket) => {
  console.log('Client connected');

  // Handle incoming data from the client
  socket.on('data', (data) => {
    // console.log('Received data from client:', data.toString());

    // You can process the received data here
    // ...

    // Optionally send a response back to the client
    socket.write(data);
  });

  // Handle socket errors
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  // Handle client disconnection
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

// Start listening for connections on the specified port
server.listen(port, host, () => {
  console.log('TCP service listening on host and port', host, port);
});
