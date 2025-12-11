import { config } from 'ace.config'
import type { AceResData, AceResError, AceResErrorEither } from './types'


export function parseError<T_Res_Data extends AceResData = any>(e: any): AceResErrorEither<T_Res_Data> {
  const error: AceResError = {
    message: config.defaultError ?? 'An error occurred'
  }

  if (e && typeof e === 'object') {
    if ('message' in e && typeof e.message === 'string') error.message = e.message
    if ('cause' in e && typeof e.cause === 'object') error.cause = e.cause
  }

  return { error }
}
