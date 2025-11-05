import { RegexMap } from './types';

export const regexApiPuts = {
  '/api/a/:id': {
    pattern: /^\/api\/a\/(?<id>[^/]+)\/?$/,
    loader: () => import('../api/a').then((m) => m.PUT)
  },
} satisfies RegexMap<'api'>
