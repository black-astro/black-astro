import type { App } from 'vue'
import { vReveal } from './reveal'
import { vTilt, vMagnetic } from './tilt'

export function installDirectives(app: App) {
  app.directive('reveal', vReveal)
  app.directive('tilt', vTilt)
  app.directive('magnetic', vMagnetic)
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
    vTilt: typeof vTilt
    vMagnetic: typeof vMagnetic
  }
}
