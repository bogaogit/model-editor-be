
/* eslint-disable no-console */
export class ConsoleLogger {
  debug(message: string, data?: Object): void {
    console.debug(message, data)
  }

  error(message: string, data?: Object): void {
    console.error(message, data)
  }

  fatal(message: string, data?: Object): void {
    console.error(message, data)
  }

  info(message: string, data?: Object): void {
    console.info(message, data)
  }

  level(): string | number {
    return 'info'
  }

  trace(message: string, data?: Object): void {
    console.trace(message, data)
  }

  warn(message: string, data?: Object): void {
    console.warn(message, data)
  }
}
