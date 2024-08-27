/* eslint-disable no-console */
import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addOnDemandServiceCommands(program: Command): void {
  const command = program.command('service').description('Commands to control on demand service.')
  startStream(command)
}

// yarn cli service start-service
function startStream(command: Command): void {
  command
    .command('start-service')
    .description('Start Tcp service')
    .action(async (str, options) => {
      const { onDemandService } = await configureApplicationForCli()
      await onDemandService.startService()
    })
}
