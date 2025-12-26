/**
 * 🧚‍♀️ How to access:
 *     - import { vParser, vApiInfo } from '@ace/vParser'
 *     - import type { vParserApiProps, vParserRouteProps, vApiInfoProps } from '@ace/vParser'
 */



import { kParse } from './kParse'
import { vParse } from './vParse'
import type { StrictSubsetKeys, Parser, BaseApiReq, BaseRouteReq, AnyValue } from './types'
import { object, optional, type ObjectEntries, type GenericSchema, type InferOutput, type OptionalSchema } from 'valibot'



export { optional, object }
export { array, picklist } from 'valibot'

export { vImg } from './vImg'
export { vNum } from './vNum'
export { vFile } from './vFile'
export { vDate } from './vDate'
export { vBool } from './vBool'
export { vEmail } from './vEmail'
export { vEnums } from './vEnums'
export { vString } from './vString'
export { vSearchParamsArray } from './vSearchParamsArray'

export const vParser = { api, route }



const SCHEMA_MAP = {
  body: '__bodySchema',
  headers: '__headersSchema',
  formData: '__formDataSchema',
  pathParams: '__pathParamsSchema',
  searchParams: '__searchParamsSchema',
} as const

const SCHEMA_KEYS = Object.keys(SCHEMA_MAP) as Array<keyof ApiObjSchema>



/** 
 * - Helpful on the `FE` when we'd love to use a slice of an `ApiInfo` > `parser`
 * - The `use server` directive w/in the `ApiResolver` ensures that only the 
 * - `ApiInfo` will be shared w/ the `FE` but none of the `ApiResolver` `logic` or `imports`
 */
export const vApiInfo = Object.keys(SCHEMA_MAP)
  .reduce((acc, key) => {
    acc[key as keyof SchemaMap] = createApiParser(key as keyof SchemaMap)
    return acc
  }, {} as any) as vApiInfoProps



/**
 * @param objSchema - An object where we do not expect the `root`, `pathParams`, or `searchParams` to be wrapped w/ `object()`
 * @returns - Parser function based on the provided schema
 */
function route<T_Input extends RouteObjSchema>(objSchema: StrictSubsetKeys<RouteObjSchema, T_Input>): Parser<RouteObjSchema2Output<T_Input>> {
  return vParse(addObjects(objSchema))
}



/**
 * @param objSchema - An object where we do not expect the `root`, `body`, `pathParams`, or `searchParams` to be wrapped w/ `object()`
 * @returns A parser based on the schema that also has `__bodySchema` appended to the parser function to be read anytime via `vParser.body()`
 */
function api<T_Input extends ApiObjSchema>(objSchema: StrictSubsetKeys<ApiObjSchema, T_Input>): ApiParser<T_Input, ApiObjSchema2Output<T_Input>> {
  const parser = vParse(addObjects(objSchema)) as ApiParser<T_Input, ApiObjSchema2Output<T_Input>>;

  // Loop through the source of truth
  for (const [publicKey, internalKey] of Object.entries(SCHEMA_MAP)) {
    const schema = objSchema[publicKey as keyof ApiObjSchema];
    if (schema) {
      (parser as any)[internalKey] = schema;
    }
  }

  return parser;
}



/**
 * - Receives `apiParser` (from `ApiInfo`) and `input` to validate
 * - Provides autocomplete while building the input, identifying what keys the body schema requires
 * - In the formData case we return a `FormData` object
 * @param apiParser - As defined @ `new ApiInfo({ parser })` w/ `vParser.api()`
 * @param input - The input we are testing
 * @param onCatch - Optional, if provided and an error happens this callback is called w/ the error
 * @returns - The parsed input or throws errors if input is invalid
 */
function createApiParser<T_ObjKey extends keyof SchemaMap>(objKey: T_ObjKey) {
  const parserKey = SCHEMA_MAP[objKey]

  return function <T_ObjSchema extends ApiObjSchema>(
    apiParser: ApiParser<T_ObjSchema> | undefined,
    input: ObjSchema2Keys<T_ObjSchema, T_ObjKey>,
    onCatch?: (e: any) => any
  ): T_ObjKey extends 'formData' ? FormData : ObjSchema2Output<T_ObjSchema, T_ObjKey> {
    if (!apiParser) throw new Error('!apiParser', { cause: { input, objKey } })

    const schema = apiParser[parserKey]

    if (!schema) throw new Error(`Schema for "${objKey}" not found in parser.`)

    // standard validation: (returns a plain object)
    const validatedData = kParse<ObjSchema2Output<T_ObjSchema, T_ObjKey>>(
      vParse(object(schema as any)) as Parser<ObjSchema2Output<T_ObjSchema, T_ObjKey>>,
      input,
      onCatch
    );

    // formData: convert object -> FormData
    if (objKey === 'formData') {
      const fd = new FormData()

      for (const [key, value] of Object.entries(validatedData as Record<string, any>)) {
        if (value !== undefined && value !== null) {
          fd.append(key, value instanceof Blob ? value : String(value)) // Blobs/Files are appended as-is, everything else as string
        }
      }
      return fd as any
    }

    return validatedData as any
  }
}



/**
 * - Valibot requires objects w/in a schema to be wrapped w/ `object()`
 * - Looks for `body`, `pathParams` & `searchParams` as keys of `objSchema` and if defined, wraps their value w/ `object()`
 * - Wraps the complete inputSchema w/ `object`
 * - IF there are objects w/in `body`, `pathParams` & `searchParams` they need to be wrapped w/ `object()` but we do not do that
 * - That logic is complex to maintain, this logic is simple and takes care of the majority of repetetive code we wanted to decrease
 */
function addObjects<T_ObjectSchema extends ApiObjSchema>(objSchema: T_ObjectSchema): GenericSchema<any> {
  const wrapped: Record<string, GenericSchema<any>> = /** wrapped object schema */ ({})
 
  for (const key of SCHEMA_KEYS) {
    const value = objSchema[key]

    if (value) { // IF value is truthy => wrap
      wrapped[key] = object(value)
    }
  }

  return object(wrapped) // final to turn js object into a schema wrap
}



/**  `{ body?: ObjSchema; formData?: ObjSchema; ... } ` */
export type ApiObjSchema = {
  [K in keyof SchemaMap]?: ObjSchema;
}


/** `{ __bodySchema?: T_Input['body']; ... }` */
type ApiParser<T_Input extends ApiObjSchema, T_Output = any> = Parser<T_Output> & {
  [K in keyof SchemaMap as SchemaMap[K]]?: T_Input[K];
}


/**
 * - `GenericSchema<any>`:
 *     - A schema is an object with a required `_parse` method
 *     - Examples: `vNum()` or `vString()`
 * - Example: `{ amount: vNum() }`
 */
type ObjSchema = Record<string, GenericSchema<any>>


/**
 * - Valibot requires objects w/in a schema to be wrapped w/ `object()`
 * - `RouteObjSchema` does not require this for the root `object({})` or for the root keys `body`, `pathParams` & `searchParams` b/c we will wrap those 4 potential (if defined) locations automatically
 * - IF there are objects w/in `body`, `pathParams` & `searchParams` they need to be wrapped w/ `object()` but we do not do that
 * - That logic is complex to maintain, this logic is simple and takes care of the majority of repetetive code we wanted to decrease
 */
export type RouteObjSchema = Omit<ApiObjSchema, 'body'>


type SchemaMap = typeof SCHEMA_MAP


export type vApiInfoProps = {
  [K in keyof SchemaMap]: ReturnType<typeof createApiParser<K>>
}


/** 
 * - `ObjectEntries`: The structure Valibot expects when calling `object()`
 * - IF value is a GenericSchema (ex: vString()) THEN places InferOutput for that value @ this key
 * - Use Valibot's internal logic to detect optionality
 */
type Entries2Output<T_Entry extends ObjectEntries> = {
  // 
  [K in keyof T_Entry as T_Entry[K] extends OptionalSchema<any, any>
  ? never
  : K]: InferOutput<T_Entry[K]>;
} & {
  [K in keyof T_Entry as T_Entry[K] extends OptionalSchema<any, any>
  ? K
  : never]?: InferOutput<T_Entry[K]>;
};


/**
 * - Receives: Api object schema
 * - Gives: Fully infered api object output
 */
type ApiObjSchema2Output<T_ObjSchema extends ApiObjSchema> = { // Maps over the keys of the `ApiObjSchema`
  // IF value is an ObjectEntries (can be placed w/in `object()`) THEN places the out put for that value @ this key
  [T_Key in keyof T_ObjSchema]: NonNullable<T_ObjSchema[T_Key]> extends ObjectEntries ? Entries2Output<NonNullable<T_ObjSchema[T_Key]>> : never
} & BaseApiReq


/**
 * - Receives: Route object schema
 * - Gives: Fully infered route object output
 */
type RouteObjSchema2Output<T_ObjSchema extends RouteObjSchema> = { // Maps over the keys of the `ApiObjSchema`
  // IF value is an ObjectEntries (can be placed w/in `object()`) THEN places the out put for that value @ this key
  [T_Key in keyof T_ObjSchema]: NonNullable<T_ObjSchema[T_Key]> extends ObjectEntries ? Entries2Output<NonNullable<T_ObjSchema[T_Key]>> : never
} & BaseRouteReq



/**
 * - `ObjSchema2Output<>`: Get the type that must be provided for `body`
 * - `AnyValue<>`: Just require the keys
 */
type ObjSchema2Keys<
  T_ObjSchema extends ApiObjSchema,
  K extends keyof ApiObjSchema
> = AnyValue<ObjSchema2Output<T_ObjSchema, K>>



/**
 * - `T_ObjSchema['body']`: Get the type of the `body` prop from the object schema
 * - `NonNullable<>`: B/c `ApiObjSchema` defines `body` as optional this removes the `undefined` from the type
 * - `Entries2Output<>`: Get the type that must be provided for body
 */
type ObjSchema2Output<
  T_ObjSchema extends ApiObjSchema,
  K extends keyof ApiObjSchema
> = Entries2Output<NonNullable<T_ObjSchema[K]>>


export type vParserApiProps = Parameters<typeof api>[0]


export type vParserRouteProps = Parameters<typeof route>[0]
