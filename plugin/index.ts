import type { Plugin } from '../app.ts'
import channel from './channel.ts'
import log from './log.ts'
import timer from './timer.ts'
import gateway from './gateway.ts'

const plugin: Plugin = async (app) => {
  await app.install(channel)
  await app.install(log)
  await app.install(timer)
  await app.install(gateway)
}

export default plugin
