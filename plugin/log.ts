import * as log from '@std/log'
import { type Plugin } from '../app.ts'

declare module '../app.ts' { interface Application { log: typeof log } }

const plugin: Plugin = (app) => {
  log.setup({
    handlers: {
      default: new log.ConsoleHandler("DEBUG", {
        formatter: log.formatters.jsonFormatter,
        useColors: true,
      }),
    },
  });

  app.log = log;
}

export default plugin
