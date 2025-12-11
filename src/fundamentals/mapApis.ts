import { buildUrl } from './buildUrl'
import type { MapBuildUrlProps } from './types'


export const mapApis = {
  'apiPostA': {
    api: () => import('../_/apiPostA').then((m) => m.default),
    info: () => import('../_/apiPostA').then((m) => m.info),
    resolver: () => import('../_/apiPostA').then((m) => m.resolver),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: [['api'], ['a'], ['choice', 'r']] }),
  },
  'apiGetB': {
    api: () => import('../_/apiGetB').then((m) => m.default),
    info: () => import('../_/apiGetB').then((m) => m.info),
    resolver: () => import('../_/apiGetB').then((m) => m.resolver),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: [['api'], ['b'], ['mode', 'r']] }),
  },
  'apiPostC': {
    api: () => import('../_/apiPostC').then((m) => m.default),
    info: () => import('../_/apiPostC').then((m) => m.info),
    resolver: () => import('../_/apiPostC').then((m) => m.resolver),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: [['api'], ['c'], ['mode', 'o']] }),
  },
} as const
