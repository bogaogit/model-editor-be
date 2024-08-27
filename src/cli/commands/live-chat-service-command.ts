/* eslint-disable no-console */
import { Command } from 'commander'
import { configureApplicationForCli } from "../application";

export function addLiveChatServiceCommands(program: Command): void {
  const command = program.command('live-chat').description('Commands to control live chat service.')
  startLiveChatService(command)
}

// yarn cli service start-service
function startLiveChatService(command: Command): void {
  command
    .command('start-service')
    .description('Start Live chat service')
    .action(async (str, options) => {
      const { liveChatService } = await configureApplicationForCli()
      await liveChatService.startService()
    })
}
