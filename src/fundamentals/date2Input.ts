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
  ```ts
  import { sessionB4 } from '@src/auth/sessionB4'
  import { db, users, amsterdamRegistrations, voiceParts, roommateOptions } from '@src/lib/db'

  export const GET = new API('/api/get-amsterdam-registration/:userId?', 'apiGetAmterdamRegistration')
    .b4([sessionB4])
    .pathParams(vParse(object({ userId: optional(vNum()) })))
    .resolve(async (scope) => {
      const {session} = scope.event.locals

      const userId = session.isAdmin && scope.pathParams.userId || session.userId // IF your an admin you can get a flight off the pathParams ELSE you can get your session flight

      const [registration] = await db
        .select({
          id: amsterdamRegistrations.id,
          email: users.email, 
          phone: amsterdamRegistrations.phone,
          gender: amsterdamRegistrations.gender,
          voicePart: voiceParts.name,
          emergencyContact: amsterdamRegistrations.emergencyContact,
          physicalLimitations: amsterdamRegistrations.physicalLimitations,
          dietaryLimitations: amsterdamRegistrations.dietaryLimitations,

          roommateOption: roommateOptions.name,
          roommateName: amsterdamRegistrations.roommateName,
          singleAgree: amsterdamRegistrations.roommateSingleAgree,

          nameOnPassport: amsterdamRegistrations.name,
          passportNumber: amsterdamRegistrations.passportNumber,
          passportIssuedDate: amsterdamRegistrations.passportIssuedDate,
          passportExpiredDate: amsterdamRegistrations.passportExpiredDate,
          passportAuthority: amsterdamRegistrations.passportAuthority,
          nationality: amsterdamRegistrations.nationality,
        })
        .from(amsterdamRegistrations)
        .leftJoin(
          voiceParts,
          eq(amsterdamRegistrations.voicePartId, voiceParts.id)
        )
        .leftJoin(
          roommateOptions,
          eq(amsterdamRegistrations.roommateOptionId, roommateOptions.id)
        )
        .leftJoin(
          users,
          eq(amsterdamRegistrations.userId, users.id)
        )
        .where(eq(users.id, userId))
        .limit(1)

      return scope.success(registration)
    })
  @example
  ```tsx
  <div class="form-item">
    <label for="passportIssuedDate">Date passport issued:</label>
    <input use:clear type="date" name="passportIssuedDate" id="passportIssuedDate" value={date2Input('date-local', registartionLoad()?.data?.passportIssuedDate)} />
    <Messages name="passportIssuedDate" />
  </div>
  ```
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export function date2Input(type: 'date-local' | 'datetime-local' | 'date-utc' | 'datetime-utc', dateLike?: DateLike): string {
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
