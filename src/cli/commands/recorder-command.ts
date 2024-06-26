/* eslint-disable no-console */
import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addRecorderCommands(program: Command): void {
  const command = program.command('recorder').description('Commands to control recorder service.')
  startStream(command)
}

// yarn cli recorder start-recording
function startStream(command: Command): void {
  command
    .command('start-recording')
    .description('Recorder to start tcp stream')
    .action(async (str, options) => {
      const { recorderService } = await configureApplicationForCli()
      await recorderService.startStream()
    })
}
