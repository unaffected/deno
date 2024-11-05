export type Plugin = (this: Application, app: Application) => void

export class Application {
  async install(plugin: Plugin) { 
    await Promise.resolve(plugin.call(this, this))

    return this
  }
}

export default new Application()