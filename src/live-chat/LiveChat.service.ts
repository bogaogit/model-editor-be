import http from "http";
import express from "express";
import { injectable } from "inversify";
import { Server } from "socket.io";
import { setTimeout } from "node:timers/promises";
import { Users } from "./User";

// Replace with the IP address or hostname of the TCP service
const host = "localhost";

// Replace with the port number of the TCP service
const port = 5000;
const MAX_TRIES = 10;


@injectable()
export class LiveChatService {
  private app;
  private server;



  constructor() {

  }

  initSocket(socket) {
    let id;
    socket
      .on("init", async () => {
        id = await Users.createUser(socket);
        if (id) {
          socket.emit("init", { id });
        } else {
          socket.emit("error", { message: "Failed to generating user id" });
        }
      })
      .on("request", (data) => {
        const receiver = Users.getUser(data.to);
        if (receiver) {
          receiver.emit("request", { from: id });
        }
      })
      .on("call", (data) => {
        const receiver = Users.getUser(data.to);
        if (receiver) {
          receiver.emit("call", { ...data, from: id });
        } else {
          socket.emit("failed");
        }
      })
      .on("end", (data) => {
        const receiver = Users.getUser(data.to);
        if (receiver) {
          receiver.emit("end");
        }
      })
      .on("disconnect", () => {
        Users.removeUser(id);
        console.log(id, "disconnected");
      });
  }

  async startService() {
    this.app = express();
    this.server = http.createServer(this.app);

    const io = new Server({ path: "/bridge", serveClient: false })
      .listen(this.server)
      .on("connection", this.initSocket);

    this.server.listen(5000, () => {
      io;
      console.log("Server is listening at :", 5000);
    });




  }

}
