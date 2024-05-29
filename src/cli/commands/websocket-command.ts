/* eslint-disable no-console */

import { Command, Option } from 'commander'
import { configureApplicationForCli } from "../application";

export function addWebSocketCommands(program: Command): void {
  const wsCommand = program.command('websocket').description('Commands to control websocket service.')
  addWebsocketConnection(wsCommand)
  getRooms(wsCommand)
}

// yarn cli websocket start
function addWebsocketConnection(wsCommand: Command): void {
  wsCommand
    .command('start <source> [destination]')
    .description('Start websocket service.')
    .addOption(new Option('-p, --pizza-type <type>', 'flavour of pizza').default('nice', 'nice pizza'))
    .option('-s, --small', 'small pizza size')
    .action(async (source, destination, options) => {
      console.log("************")
      if (options.small) console.log('- small pizza size');
      if (options.pizzaType) console.log(`- ${options.pizzaType}`);
      console.log(source);
      console.log(destination);

      const { webSocketService } = await configureApplicationForCli()
      await webSocketService.startWebSocketService()
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
