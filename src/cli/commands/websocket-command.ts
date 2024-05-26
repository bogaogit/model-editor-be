/* eslint-disable no-console */

import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addWebSocketCommands(program: Command): void {
  const wsCommand = program.command('websocket').description('Commands to control websocket service.')
  addWebsocketConnection(wsCommand)
  getRooms(wsCommand)
}

// yarn cli websocket addConnection abc
function addWebsocketConnection(wsCommand: Command): void {
  wsCommand
    .command('addConnection')
    .description('Connect to websocket and get list of rooms.')
    .action(async (str, options) => {
      const { webSocketService } = await configureApplicationForCli()
      await webSocketService.setupWebSocketService()
    })
}

// yarn cli websocket getRooms
function getRooms(wsCommand: Command): void {
  wsCommand
    .command('getRooms')
    .description('Get connected rooms information in websocket server.')
    .action(async (str, options) => {
      const { webSocketService } = await configureApplicationForCli()
      const rooms = webSocketService.getRooms()
      console.log(rooms)
    })
}