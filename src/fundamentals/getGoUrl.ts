import { goHeaderName } from './vars'

export function getGoUrl(response: Response): string | null {
  return (response.status === 204)
    ? response.headers.get(goHeaderName) ?? null
    : null
}
