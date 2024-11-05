import { Client } from '@geacko/redis-client'
import type { Plugin } from '../app.ts'

declare module '../app.ts' { interface Application { store: Client } }

const plugin: Plugin = async (app) => {
  app.store = new Client(await Deno.connect({ port: 6379 }))

  await app.store.send(['HELLO', '3']).read()
}

export default plugin
