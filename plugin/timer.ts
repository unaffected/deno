import type { Plugin } from '../app.ts'

declare module '../app.ts' {
  interface Application {
    timeout: (callback: (...args: unknown[]) => void, expiration?: number) => Timer
    wait: (duration: number) => Promise<boolean>
  }
}

export type Timer = {
  callback: (timer: Timer) => void
  cancel: () => void
  created_at: number
  expires_at: number
  expiration: number
  reset: () => void
  timeout: number
}

export const create = (callback: (...args: unknown[]) => void, expiration = 0) => {
  const created_at = Date.now()
  const expires_at = created_at + expiration
  const timeout = setTimeout(() => callback(timer), expiration)

  const cancel = () => clearTimeout(timeout)

  const reset = () => {
    cancel()

    return create(callback, timer.expiration)
  }

  const timer: Timer = {
    callback,
    cancel,
    created_at,
    expiration,
    expires_at,
    timeout,
    reset,
  }

  return timer
}

export const wait = (duration = 0): Promise<boolean> => new Promise((resolve) => {
  setTimeout(() => { resolve(true) }, duration)
})

export const plugin: Plugin = (app) => {
  app.timeout = create
  app.wait = wait
}

export default plugin
