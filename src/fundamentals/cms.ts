/**
 * 🧚‍♀️ How to access:
 *     - import { CMS } from '@ace/cms'
 */


import type { Row } from '@libsql/client'
import type { CMSMap, JSONResponse } from './types'
import { createEffect, createSignal, type Accessor } from 'solid-js'


export class CMS {
  #signal = createSignal<CMSMap>(new Map())

  constructor(cmsLoad: Accessor<JSONResponse<Row[]> | undefined>) {
    createEffect(() => {
      const res = cmsLoad()

      this.#signal[1](map => {
        if (Array.isArray(res?.data)) {
          for (const row of res.data) {
            if (typeof row.id === 'number' && typeof row.label === 'string' && typeof row.content === 'string' && typeof row.pageId === 'number' && typeof row.pageName === 'string') {
              map.set(row.id, { id: row.id, label: row.label, content: row.content, pageId: row.pageId, pageName: row.pageName })
            }
          }
        }

        return new Map(map)
      })
    })
  }

  getMap = (): CMSMap => this.#signal[0]()
  getMapAccessor = (): Accessor<CMSMap> => this.#signal[0]
  getContent = (id: number): string | undefined => this.#signal[0]().get(id)?.content
}
