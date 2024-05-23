import { Command } from "commander";
import { addWebSocketCommands } from "./commands/websocket-command";
import { addRecorderCommands } from "./commands/recorder-command";

// yarn cli split --separator=/ a/b/c

const program = new Command()

program
  .name('dForm')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

addWebSocketCommands(program)
addRecorderCommands(program)

program.parse();
