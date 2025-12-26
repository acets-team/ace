/**
 * - String is passed to `new Date()`
 * - Date is already a `new Date()`
 * - Number is `epoch` and passed to `new Date()` assumed to be in milliseconds
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export type DateLike = string | Date | number


export type BaseJWTPayload = Record<string, unknown>

/**
 * - JWTPayload is defined @ ace.config.js
 * - The FullJWTPayload adds `{iat: number, exp: number}` to the payload to align w/ the `JWT spec (RFC 7519)`
 * - The `JWTPayload` is what is stored in the jwt and the `JWTResponse` is created if the `JWTPayload` is valid
 * - We recomend only putting a sessionId in the `JWTPayload`, and also putting the sessionId in the database, so you can always sign someone out by removing the db entry and then putting any goodies ya love in the `JWTResponse` like email, name, isAdmin, etc.
 */
export type FullJWTPayload<T_JWTPayload extends BaseJWTPayload = {}> = T_JWTPayload & { iat: number, exp: number }


export type JWTValidateSuccess<T_JWTPayload extends BaseJWTPayload = {}> = {
  isValid: true
  payload: FullJWTPayload<T_JWTPayload>
  errorId?: never
  errorMessage?: never
}

export type JWTValidateFailure<T_JWTPayload extends BaseJWTPayload = {}> = {
  isValid: false
  payload?: FullJWTPayload<T_JWTPayload>
  errorId: 'FALSY_JWT' | 'INVALID_PARTS' | 'INVALID_EXP' | 'INVALID_JWT' | 'EXPIRED'
  errorMessage: string
}

export type JWTValidateResponse<T_JWTPayload extends BaseJWTPayload = {}> = JWTValidateSuccess<T_JWTPayload> | JWTValidateFailure<T_JWTPayload>


export type FormDataValue = string | File


export type FormDataObject = Record<string, FormDataValue | FormDataValue[]>


export type R2OnlyIf = {
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match */
  'If-Match': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-None-Match */
  'If-None-Match': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Modified-Since */
  'If-Modified-Since': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Unmodified-Since */
  'If-Unmodified-Since': string,
}


export type R2HttpMetadata = {
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types */
  'Content-Type': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Language */
  'Content-Language': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition */
  'Content-Disposition': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding */
  'Content-Encoding': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control */
  'Cache-Control': string,
  /** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control */
  'Expires': string,
}

export type R2ListOptions = {
  limit ?: number;
  prefix ?: string;
  cursor ?: string;
  delimiter ?: string;
  startAfter ?: string;
  include ?: ('httpMetadata' | 'customMetadata')[];
}


export type R2ResEither =
  | { error: string, data?: never } // error
  | { data: string, error?: never } // onDelete()
  | { data: R2ResPut, error?: never } // onPut()
  | { data: R2ResList, error?: never } // onGet() -> list


export type R2ResList = {
  key: string,
  /** Helpful for database indexing & internal comparisons */
  etag: string,
  /** Helpful for HTTP Headers (ETag, If-None-Match) */
  httpEtag: string,
  /** iso */
  uploaded: string,
  httpMetadata?: R2HTTPMetadata,
  customMetadata?: Record<string, string>,
}[]


export type R2ResPut = {
  key: string
  version: string
  size: number
  /** Helpful for database indexing & internal comparisons */
  etag: string
  /** Helpful for HTTP Headers (ETag, If-None-Match) */
  httpEtag: string
  /** iso */
  uploaded: string
  httpMetadata?: R2HTTPMetadata
  customMetadata?: Record<string, string>
  range?: R2Range
  checksums: R2Checksums;
} | null


export type R2Range = { offset: number, length?: number }
  | { offset?: number, length: number; }
  | { suffix: number }


declare global {
  interface RequestInit {
    /**
     * - Required when sending a ReadableStream as a request body
     * - 'half' is the only currently supported value for most environments.
     */
    duplex?: 'half' | 'full';
  }
}
