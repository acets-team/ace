import { buildUrl } from './buildUrl'
import type { MapBuildUrlProps } from './types'


export const mapRoutes = {
  '/route/:id': {
    route: () => import('../_/route').then((m) => m.default),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: [['route'], ['id', 'r']] }),
  },
} as const
