/**
 * 🧚‍♀️ How to access:
 *     - import { MongoModel } from '@ace/mongoModel'
 *     - import type { Lean, InferMongoModel, InferDoc, Leanify, MongoProjection } from '@ace/mongoModel'
 */


import mongoose, { model, Model, type Schema, type InferSchemaType, type Types } from 'mongoose'


/**
 * TSchema = the raw schema
 * TDoc    = the document type (inferred from schema + _id:string)
 */
export class MongoModel<TSchema extends Schema, TDoc = InferSchemaType<TSchema> & { _id: string }> {
  #name: string
  #schema: TSchema


  private constructor(name: string, schema: TSchema) {
    this.#name = name
    this.#schema = schema
  }


  /**
   * Create() now implicitly sets TLean = Leanify<TDoc>.
   */
  static Create<TSchema extends Schema>(name: string, schema: TSchema) {
    return new MongoModel<TSchema>(name, schema)
  }

  /**
   * By default, this returns Model<TDoc, …, TLean> so that:
   *
   *   // non-lean queries return TDoc
   *   const doc: TDoc | null = await model.findById(...).exec()
   *
   *   // lean() queries return TLean
   *   const leanDoc: TLean | null = await model.findById(...).lean().exec()
   */
  get(): Model<TDoc> {
    return (mongoose.connection.models[this.#name] as Model<any>) || model<any>(this.#name, this.#schema)
  }

  getName() {
    return this.#name
  }
}


export type InferDoc<T extends MongoModel<any, any>> = T extends MongoModel<any, infer TDoc>
  ? TDoc
  : never


/**
 * - Go from a model to the inferred schema
 * - IF "T" is a "Model" THEN set "U" to Model's 2nd type, which is the infered type of this.schema, aka InferSchemaType<typeof this.schema>
 */
export type InferMongoModel<T extends MongoModel<any, any>> = T extends MongoModel<any, infer U> ? U : never



/** Helps create a type-safe mongoose projection for schema fields */
export type MongoProjection<T> = { [K in keyof T]?: 0 | 1 }


/**
 * - Recursively turn every ObjectId or Date into string
 * - Turn Mongoose’s DocumentArray's into plain arrays
 */
export type Leanify<T> =
  // ObjectId => string
  T extends Types.ObjectId ? string :

  // Date => string
  T extends Date            ? string :

  // Mongoose DocumentArray<Elem> => Leanify<Elem>[]
  T extends Types.DocumentArray<infer Elem> ? Leanify<Elem>[] :

  // Plain TS arrays too
  T extends Array<infer U>  ? Leanify<U>[] :

  // Everything else that’s an object, recurse
  T extends object          ? { [K in keyof T]: Leanify<T[K]> } :

  // Fallback (primitives, functions, etc)
  T


/**
 * Does `Leanify` & `InferDoc` for us
 * @exampe
  ```ts
  const contract = await M_Contract.get()
    .findById(be.getParams().contractId)
    .lean<Leanify<InferDoc<typeof M_Contract>>>()
    .exec()
  ```
 */
export type Lean<TModel extends MongoModel<any>> = Leanify<InferDoc<TModel>>
