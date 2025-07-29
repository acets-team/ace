export const regexApiGets = {
  '/api/a/:id': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.GET)
  },
} as const
