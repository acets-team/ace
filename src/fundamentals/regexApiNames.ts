import { RegexMap } from './types'

export const regexApiNames = {
  'apiGetA': {
    path: '/api/a/:id',
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.GET)
  },
  'apiPostA': {
    path: '/api/a',
    pattern: /^\/api\/a\/?$/,
    loader: () => import('../api/a').then((m) => m.POST)
  },
  'apiPutA': {
    path: '/api/a/:id',
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.PUT)
  },
  'apiDeleteA': {
    path: '/api/a/:id',
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.DELETE)
  },
} satisfies RegexMap<'api'>
