/* eslint-disable no-console */

import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addWebSocketCommand(program: Command): void {
  const wsCommand = program.command('websocket').description('Commands to control websocket service.')
  addWebsocketConnection(wsCommand)
}

// yarn cli websocket addConnection abc
function addWebsocketConnection(wsCommand: Command): void {
  wsCommand
    .command('addConnection')
    .description('Connect to websocket and get list of rooms.')
    .argument('<string>', 'string to split')
    .action(async (str, options) => {
      const { webSocketService } = await configureApplicationForCli()
      await webSocketService.setupWebSocketService()
      // console.log("websocket !!" + str)
    })
}
