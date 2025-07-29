export const regexApiDeletes = {
  '/api/a/:id': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.DELETE)
  },
} as const
