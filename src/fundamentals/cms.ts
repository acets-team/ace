/**
 * 🧚‍♀️ How to access:
 *     - import { CMS } from '@ace/cms'
 */


import type { CMSItem, CMSMap, JSONResponse } from './types'
import { createEffect, createSignal, type Accessor } from 'solid-js'


export class CMS {
  #signal = createSignal<CMSMap>(new Map())

  constructor(cmsLoad: Accessor<JSONResponse<CMSItem[]> | undefined>) {
    createEffect(() => {
      const res = cmsLoad()
      const rows = res?.data

      if (!rows || !Array.isArray(rows)) return

      this.#signal[1](() => {
        const map: CMSMap = new Map()

        for (const row of rows) {
          map.set(row.id, row)
        }

        return map
      })
    })
  }

  getMap = (): CMSMap => this.#signal[0]()
  getContent = (id: number): string | undefined => this.#signal[0]().get(id)?.content
}
