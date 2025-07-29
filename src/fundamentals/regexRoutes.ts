import type { RegexMap } from './types';


export const regexRoutes = {
  '/a:id': {
    pattern: /^\/a:id\/?$/,
    loader: () => import('../app/a').then((m) => m.default)
  },
} as const satisfies RegexMap<'route'>
