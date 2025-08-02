/**
 * 🧚‍♀️ How to access:
 *     - import { CMS } from '@ace/cms'
 */


import type { API } from './api'
import { createEffect, createSignal, type Accessor } from 'solid-js'
import type { API2Response, APIResponse, CMSItem, CMSMap } from './types'


export class CMS {
  #signal = createSignal<CMSMap>(new Map())

  constructor(cmsLoad: Accessor<API2Response<API<{}, {}, {}, APIResponse<CMSItem[]>, any>> | undefined>) {
    createEffect(() => {
      const cmsData = cmsLoad()?.data
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
