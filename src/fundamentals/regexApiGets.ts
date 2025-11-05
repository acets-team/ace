import { RegexMap } from './types'

export const regexApiGets = {
  '/api/a/:id': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.GET)
  },
} satisfies RegexMap<'api'>
