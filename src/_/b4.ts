import type { B4 } from '../fundamentals/types'

export const exampleB4: B4<{ example: boolean }> = async (scope) => {
  scope.event.locals.example = true
}

export const testB4: B4<{ test: string }> = async (scope) => {
  scope.event.locals.test = 'true'
}
