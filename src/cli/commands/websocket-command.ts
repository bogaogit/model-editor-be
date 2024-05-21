/* eslint-disable no-console */

import { Command } from 'commander'

export function addWebSocketCommand(program: Command): void {
  const wsCommand = program.command('websocket').description('Commands to control websocket service.')
  addWebsocketConnection(wsCommand)
}

function addWebsocketConnection(wsCommand: Command): void {
  wsCommand
    .command('websocket')
    .description('Connect to websocket and get list of rooms.')
    .argument('<string>', 'string to split')
    .action(async (str, options) => {
      // const { logger } = await configureApplicationForCli({ skipConfigLoad: true, useConsoleLogger: true })
      console.log("websocket !!" + str)
    })
}
