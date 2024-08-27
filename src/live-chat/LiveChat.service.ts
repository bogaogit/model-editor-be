import http from "http";
import express from "express";
import { injectable } from "inversify";
import { Server } from "socket.io";
import { setTimeout } from "node:timers/promises";
import { Users } from "./User";
import cors from "cors";

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
    this.app.use(cors());
    this.app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);

      // Pass to next layer of middleware
      next();
    });
    this.server = http.createServer(this.app);

    const io = new Server({ path: "/bridge", serveClient: false ,cors: {
        origin: "*",
        methods: ["*"],
        allowedHeaders: ["*"],
        credentials: true
      }}
    )
      .listen(this.server)
      .on("connection", this.initSocket);

    this.server.listen(5000, () => {
      io;
      console.log("Server is listening at :", 5000);
    });


  }

}
