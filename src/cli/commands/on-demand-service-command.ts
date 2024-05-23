/* eslint-disable no-console */
import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addOnDemandServiceCommands(program: Command): void {
  const command = program.command('onDemandService').description('Commands to control on demand service.')
  startStream(command)
}

// yarn cli onDemandService startService
function startStream(command: Command): void {
  command
    .command('startService')
    .description('Start Tcp service')
    .action(async (str, options) => {
      const { onDemandService } = await configureApplicationForCli()
      await onDemandService.startService()
    })
}
