import http from "http";
import express from "express";
import { injectable } from "inversify";
import { Server } from "socket.io";
import { setTimeout } from "node:timers/promises";

// Replace with the IP address or hostname of the TCP service
const host = "localhost";

// Replace with the port number of the TCP service
const port = 5000;
const MAX_TRIES = 10;

const adjs = [
  "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
  "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
  "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
  "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
  "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
  "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
  "wandering", "withered", "wild", "black", "young", "holy", "solitary",
  "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
  "polished", "ancient", "purple", "lively", "nameless"
];

const nouns = [
  "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
  "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
  "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
  "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
  "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
  "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
  "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
  "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
  "frog", "smoke", "star"
];


export class Users {
  private app;
  private server;
  static users = {};


  constructor() {

  }


  static createId() {
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const MIN = 1000;
    const MAX = 9999;
    const num = Math.floor(Math.random() * ((MAX + 1) - MIN)) + MIN;

    return `${adj}-${noun}-${num}`;
  }


  static async randomID(counter = 0) {
    if (counter > MAX_TRIES) {
      return null;
    }
    await setTimeout(10);
    const id = this.createId();
    return id in Users.users ? this.randomID(counter + 1) : id;
  }

  static async createUser(socket) {
    const id = await this.randomID();
    if (id) {
      Users.users[id] = socket;
    }
    return id;
  };

  static getUser(id) {
    return Users.users[id];
  }

  static removeUser(id) {
    delete Users.users[id];
  }


}
