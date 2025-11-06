import { regexApiNames } from "./regexApiNames";

export const regexApiDeletes = {
  '/api/a/:id': regexApiNames['apiGetA'],
} as const
