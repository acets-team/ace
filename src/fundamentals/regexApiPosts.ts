import { RegexMap } from './types'

export const regexApiPosts = {
  '/api/b': {
    pattern: /^\/api\/a\/?$/,
    loader: () => import('../api/a').then((m) => m.POST)
  },
} satisfies RegexMap<'api'>
