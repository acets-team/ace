/**
 * 🧚‍♀️ How to access:
 *     - import { CMS } from '@ace/cms'
 */


import type { API } from './api'
import { createEffect, createSignal, type Signal, type Accessor } from 'solid-js'
import type { Api2Response, ApiResponse, CMSItem, CMSMap } from './types'


/**
 * @example
  ```ts
  // 🗂️ ./src/lib/cmsLoad.ts

  import { load } from '@ace/load'
  import { CMS } from '@ace/cmsInstance'
  import { apiGetCMSByPage } from '@ace/apis'
  import type { PageNames } from '@src/lib/vars'


  export function cmsLoad(page: PageNames) {
    return new CMS(load({ key: 'cms-' + page, fn: () => apiGetCMSByPage({ pathParams: {name: page}}) }))
  }

  // 🗂️ ./src/lib/vars.ts

  import { Enums, type InferEnums } from '@ace/enums'

  export const pageNames = new Enums(['home', 'about', 'members'])
  export type PageNames = InferEnums<typeof pageNames>

  // 🗂️ ./src/api/apiGetCMSByPage.ts

  import { API } from '@ace/api'
  import { object } from 'valibot'
  import { cmsApi } from '@ace/cmsApi'
  import { vParse } from '@ace/vParse'
  import { vEnums } from '@ace/vEnums'
  import { pageNames } from '@src/lib/vars'
  import { getByPageName } from '@ace/cmsSQL'


  export const GET = new API('/api/get-cms-by-page/:name', 'apiGetCMSByPage')
    .pathParams(vParse(object({name: vEnums(pageNames) })))
    .resolve(async (scope) => {
      return scope.success(
        await cmsApi(getByPageName(), scope.pathParams)
      )
    })
  ```
 */
export class CMS {
  map: CMSMap

  constructor(cmsLoad: Accessor<Api2Response<API<{}, {}, {}, ApiResponse<CMSItem[]>, any>> | undefined>) {
    this.map = new Map()

    createEffect(() => {
      const cmsData = cmsLoad()?.data
      if (!cmsData || !Array.isArray(cmsData)) return

      for (const row of cmsData) {
        const signal = this.#getSignal(row.id) // each row in db = cms value in map = signal

        signal[1](row) // update signal

        this.map.set(row.id, signal)
      }
    })
  }

  getValue (id: number): undefined | CMSItem {
    return this.#getSignal(id)[0]()
  }

  getContent (id: number): undefined | string {
    return this.getValue(id)?.content
  }

  #getSignal(id: number): Signal<CMSItem | undefined> {
    let signal = this.map.get(id) // maybe

    if (!signal) { // nope
      signal = createSignal() // create
      this.map.set(id, signal) // store
    }

    return signal // give
  }
}
