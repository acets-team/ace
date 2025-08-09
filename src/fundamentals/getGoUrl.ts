import { goHeaderName } from './vars'

export function getGoUrl(response: Response): string | null {
  return (response.status === 200)
    ? response.headers.get(goHeaderName) ?? null
    : null
}
