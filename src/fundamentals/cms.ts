/**
 * 🧚‍♀️ How to access:
 *     - import { CMS } from '@ace/cms'
 */


import { getData } from './getData'
import { createEffect, createSignal } from 'solid-js'
import type { AccessorWithLatest } from '@solidjs/router'
import type { CMSItem, CMSMap, APIResponse } from './types'


export class CMS {
  #signal = createSignal<CMSMap>(new Map())

  constructor(cmsLoad: AccessorWithLatest<APIResponse<CMSItem[]> | undefined>) {
    createEffect(() => {
      const cmsData = getData(cmsLoad())
      if (!cmsData || !Array.isArray(cmsData)) return

      this.#signal[1](() => {
        const map: CMSMap = new Map()

        for (const row of cmsData) {
          map.set(row.id, row)
        }

        return map
      })
    })
  }

  getMap = (): CMSMap => this.#signal[0]()
  getContent = (id: number): string | undefined => this.#signal[0]().get(id)?.content
}
