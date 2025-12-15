import { kParse } from './kParse'
import { vParse } from './vParse'
import type { StrictSubsetKeys, Parser, BaseApiReq, BaseRouteReq, AnyValue } from './types'
import { object, optional, type ObjectEntries, type GenericSchema, type InferOutput } from 'valibot'



export { optional, object }
export { vImg } from './vImg'
export { vNum } from './vNum'
export { vFile } from './vFile'
export { vDate } from './vDate'
export { vBool } from './vBool'
export { vEmail } from './vEmail'
export { vEnums } from './vEnums'
export { vString } from './vString'
export const vParser = { api, body, route }



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
function api<T_Input extends ApiObjSchema>(objSchema: StrictSubsetKeys<ApiObjSchema, T_Input>): ParserWithBodySchema<T_Input, ApiObjSchema2Output<T_Input>> {
  const parser: ParserWithBodySchema<T_Input, ApiObjSchema2Output<T_Input>> = vParse(addObjects(objSchema))

  if (objSchema.body) { // IF body schema provided -> attach schema to the parser function so it may be read @ `vParser.body()`
    parser.__bodySchema = objSchema.body;
  }

  return parser
}



/**
 * - Receives `apiParser` (from `ApiInfo`) and `input` to validate
 * - Provides autocomplete while building the input, identifying what keys the body schema requires
 * @param apiParser - As defined @ `new ApiInfo({ parser })` w/ `vParser.api()`
 * @param input - The input we are testing
 * @param onCatch - Optional, if provided and an error happens this callback is called w/ the error
 * @returns - The parsed input or throws errors if input is invalid
 */
function body<T_ObjSchema extends ApiObjSchema>(
  apiParser: ParserWithBodySchema<T_ObjSchema> | undefined,
  input: ObjSchema2BodyKeys<T_ObjSchema>,
  onCatch?: (e: any) => any
): ObjSchema2Body<T_ObjSchema> {
  if (!apiParser) throw new Error('Please provide a truthy apiParser', { cause: { input } })

  const bodySchema = apiParser.__bodySchema
  if (!bodySchema) throw new Error('Please provide an apiParser w/ a truthy __bodySchema prop. This is defined during vParser.api()', { cause: { apiParser, input } })

  return kParse(vParse(object(bodySchema)), input, onCatch) // call parser
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

  const topLevelKeys: Array<keyof ApiObjSchema> = /** keys to wrap w/ `object` */ (['body', 'pathParams', 'searchParams'])

  for (const key of topLevelKeys) {
    const value = objSchema[key]

    if (value) { // IF value is truthy => wrap
      wrapped[key] = object(value)
    }
  }

  return object(wrapped) // final to turn js object into a schema wrap
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
 * - `ApiObjSchema` does not require this for the root `object({})` or for the root keys `body`, `pathParams` & `searchParams` b/c we will wrap those 4 potential (if defined) locations automatically
 * - IF there are objects w/in `body`, `pathParams` & `searchParams` they need to be wrapped w/ `object()` but we do not do that
 * - That logic is complex to maintain, this logic is simple and takes care of the majority of repetetive code we wanted to decrease
 */
export type ApiObjSchema = {
  body?: ObjSchema;
  pathParams?: ObjSchema;
  searchParams?: ObjSchema;
}



/**
 * - Valibot requires objects w/in a schema to be wrapped w/ `object()`
 * - `RouteObjSchema` does not require this for the root `object({})` or for the root keys `body`, `pathParams` & `searchParams` b/c we will wrap those 4 potential (if defined) locations automatically
 * - IF there are objects w/in `body`, `pathParams` & `searchParams` they need to be wrapped w/ `object()` but we do not do that
 * - That logic is complex to maintain, this logic is simple and takes care of the majority of repetetive code we wanted to decrease
 */
export type RouteObjSchema = Omit<ApiObjSchema, 'body'>



/** Parser that has been through vParser.api() to get __bodySchema attached to it */
type ParserWithBodySchema<T_Input extends ApiObjSchema, T_Output = any> = Parser<T_Output> & { __bodySchema?: T_Input['body'] }



/** `ObjectEntries`: The structure Valibot expects when calling `object()` */
type Entries2Output<T_Entry extends ObjectEntries> = { // Maps over the keys of the `ObjectEntries`
  // IF value is a GenericSchema (ex: vString()) THEN places InferOutput for that value @ this key
  [T_Key in keyof T_Entry]: T_Entry[T_Key] extends GenericSchema<any> ? InferOutput<T_Entry[T_Key]> : never
}


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
 * - `T_ObjSchema['body']`: Get the type of the `body` prop from the object schema
 * - `NonNullable<>`: B/c `ApiObjSchema` defines `body` as optional this removes the `undefined` from the type
 * - `Entry2Output<>`: Get the type that must be provided for body
 */
type ObjSchema2Body<T_ObjSchema extends ApiObjSchema> = Entries2Output<NonNullable<T_ObjSchema['body']>>


/**
 * - `T_ObjSchema['body']`: Get the type of the `body` prop from the object schema
 * - `NonNullable<>`: B/c `ApiObjSchema` defines `body` as optional this removes the `undefined` from the type
 * - `Entry2Output<>`: Get the type that must be provided for body
 * - `AnyValue<>`: Just require the keys
 */
type ObjSchema2BodyKeys<T_ObjSchema extends ApiObjSchema> = AnyValue<ObjSchema2Body<T_ObjSchema>>
