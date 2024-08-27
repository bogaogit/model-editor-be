import net, { Server } from "net";
import { injectable } from "inversify";
import { createWriteStream } from "fs";
import { Readable } from "stream";

// Replace with the IP address or hostname of the TCP service
const host = "localhost";

// Replace with the port number of the TCP service
const port = 7070;

@injectable()
export class OnDemandService {
  private server: Server;

  constructor() {
  }

  startService() {
    const tcpStreamReadable = new Readable({
      read() {},
    })

    this.server = net.createServer((socket) => {
      console.log("Client connected");




      // Handle incoming data from the client
      socket.on("data", (data) => {
        // socket.write(data);
        if (data) {
          tcpStreamReadable.push(data)
        }
      });

      const writeToDiskStream = createWriteStream("D:\\repo\\test2aaa.flv");

      tcpStreamReadable.pipe(writeToDiskStream);

      // Handle socket errors
      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });

      // Handle client disconnection
      socket.on("end", () => {
        console.log("Client disconnected");
      });
    });

// Start listening for connections on the specified port
    this.server.listen(port, host, () => {
      console.log("TCP service listening on host and port", host, port);
    });
  }
}
