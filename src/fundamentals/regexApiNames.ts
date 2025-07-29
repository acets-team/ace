export const regexApiNames = {
  'apiGetA': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.GET)
  },
  'apiPostA': {
    pattern: /^\/api\/a\/?$/,
    loader: () => import('../api/a').then((m) => m.POST)
  },
  'apiPutA': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.PUT)
  },
  'apiDeleteA': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.GET)
  },
} as const
