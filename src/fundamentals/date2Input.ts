/**
 * 🧚‍♀️ How to access:
 *     - import { date2Iso } from '@ace/date2Iso'
 */


import { date2Iso } from './date2Iso'
import type { DateLike } from './types'
import { dateLike2Date } from './dateLike2Date'


/**
 * - IF `dateLike` is falsy we'll give back a empty string ELSE we'll convert `dateLike` into a string value that can be given to input type `date` or `datetime-local`
 * - If converting a utc db time into local time (typical) you'll want to use one of the `-local` types and call this function from the `FE`. So on the BE call `const iso = date2Iso(d)` and then on the `FE` call `date2Input(iso, 'date-local' | 'datetime-local')`
 * - If saving as utc after they've done the form input (typical) use `createOnSubmit()` + `fd()` and it'll call `dateFromInput()` for ya
  @example
  ```
  export const GET = new API('/api/get-amsterdam-registration/:userId?', 'apiGetAmterdamRegistration')
    .pathParams(vParse(object({ userId: optional(vNum()) })))
    .resolve(async (scope) => {
      const [registration] = await db
        .select({
          id: amsterdamRegistrations.id,
          email: users.email, 

          passportIssuedDate: amsterdamRegistrations.passportIssuedDate,
          passportExpiredDate: amsterdamRegistrations.passportExpiredDate,
        })
        .from(amsterdamRegistrations)
        .leftJoin(
          users,
          eq(amsterdamRegistrations.userId, users.id)
        )
        .where(eq(users.id, scope.pathParams.userId || (await jwtParse(scope)).payload.userId))
        .limit(1)

      return scope.success(!registration ? null : {
        ...registration,
        passportIssuedDate: parseDate(registration.passportIssuedDate),
        passportExpiredDate: parseDate(registration.passportExpiredDate),
      })
    })


  function parseDate(d: Date) {
    return {
      iso: date2Iso(d),
      english: date2English(d),
    }
  }
  ```
  @example
  ```tsx
  <div class="form-item">
    <label for="passportIssuedDate">Date passport issued:</label>
    <input use:clear type="date" name="passportIssuedDate" id="passportIssuedDate" value={date2Input(registartionLoad()?.data?.passportIssuedDate.iso ?? '', 'date-local')} />
    <Messages name="passportIssuedDate" />
  </div>
  ```
  @example
  ```tsx
  <Show when={registration()}>
    <div class="field">
      <div class="label">Issued:</div>
      <div class="value">{registration()?.passportIssuedDate.english}</div>
    </div>
  </Show>
  ```
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export function date2Input(dateLike: DateLike, type: 'date-local' | 'datetime-local' | 'date-utc' | 'datetime-utc'): string {
  debugger
  if (!dateLike) return ''

  switch (type) {
    case 'date-local':
    case 'datetime-local':
      const d = dateLike2Date(dateLike)
      const ymd = d.getFullYear() +'-'+ pad(d.getMonth() + 1) +'-'+ pad(d.getDate()) 

      switch (type) {
        case 'date-local': return ymd
        case 'datetime-local': return ymd +'T'+ pad(d.getHours()) +':'+ pad(d.getMinutes())
      }
    case 'date-utc':
    case 'datetime-utc':
      return date2Iso(dateLike).slice(0, type === 'date-utc' ? 10 : 16)
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
