import { Envs } from './envs'


export function getEnv(envVariableKey: Envs, fallback?: string): string {
  const value = process.env[envVariableKey] ?? fallback
  if (!value) throw new Error('Environment variable missing, determine based on stack trace')

  return value
}
