import type { Plugin } from '../app.ts'
import * as timer from './timer.ts'

declare module '../app.ts' { interface Application { channel: Channel } }

export type Options = {
  expire?: number
  limit?: number
  on_expired?: (subscription: Subscription) => void
  unique?: boolean
}

export type Subscription<T extends string = string, D = unknown> = {
  type: T
  execute: (data: D) => void | Promise<void>
  options?: Options
}

export type Subscriptions = Array<Subscription & {
  id?: string
  invocations?: number
  timer?: timer.Timer
}>

export class Channel {
  #subscriptions: Subscriptions

  constructor(subscriptions: Subscription[] = []) {
    this.#subscriptions = subscriptions
  }

  get subscriptions() {
    return this.#subscriptions
  }

  publish<D = unknown>(event: string, data?: D) {
    const triggers = this.#subscriptions
      .map(({ execute, invocations, options, type }, idx) => {
        if (type !== event.toLowerCase()) {
          return false
        }

        this.#subscriptions[idx].invocations = (invocations ?? 0) + 1

        if (options?.limit && this.#subscriptions[idx].invocations >= options.limit) {
          this.unsubscribe(type, execute)
        }

        return new Promise((resolve, reject) => {
          try {
            resolve(execute(data))
          } catch (error) {
            reject(error)
          }
        })
      })
      .filter(Boolean)

    Promise.all(triggers).catch(() => {})

    return this
  }

  subscribe(type: string, execute: Subscription['execute'], options: Options = {}) {
    const subscription = {
      execute,
      id: globalThis.crypto.randomUUID(),
      type: type.toLowerCase(),
      options,
    }

    if (options.expire) {
      this.expire(subscription, options)
    }

    if (options.unique) {
      this.unsubscribe(subscription.type)
    }

    this.subscriptions.push(subscription)

    return this
  }

  unsubscribe(type?: string, execute?: Subscription['execute']) {
    if (!type) {
      this.#subscriptions = []

      return this
    }

    this.#subscriptions = this.#subscriptions.filter((subscription) => {
      if (subscription.type !== type.toLowerCase()) {
        return true
      }

      if (execute && subscription.execute !== execute) {
        return true
      }

      return false
    })

    return this
  }

  emit<D = unknown>(type: string, data?: D) {
    return this.publish(type, data)
  }

  on(type: string, execute: Subscription['execute'], options: Options = {}) {
    return this.subscribe(type, execute, options)
  }

  once(type: string, execute: Subscription['execute'], options: Options = {}) {
    options.limit = 1

    return this.subscribe(type, execute, options)
  }

  off(type?: string, execute?: Subscription['execute']) {
    return this.unsubscribe(type, execute)
  }

  private expire(subscription: Subscription, options: Options) {
    timer.create(() => {
      this.unsubscribe(subscription.type, subscription.execute)

      if (options.on_expired) {
        options.on_expired(subscription)
      }
    }, options.expire)
  }
}

export const plugin: Plugin = (app) => {
  app.channel = new Channel()
}

export default plugin