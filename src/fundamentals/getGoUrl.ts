import { goHeaderName, goStatusCode } from './vars'

export function getGoUrl(response: Response): string | null {
  return (response.status === goStatusCode)
    ? response.headers.get(goHeaderName) ?? null
    : null
}
