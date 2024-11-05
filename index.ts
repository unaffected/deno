import app from './app.ts'
import plugins from './plugin/index.ts'

await app.install(plugins)

await app.wait(500)

app.channel.on('message', (message: unknown) => {
  app.log.info(`Received message: ${message}`)
})