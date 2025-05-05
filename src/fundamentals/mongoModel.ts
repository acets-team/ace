/**
 * 🧚‍♀️ How to access:
 *     - import { MongoModel } from '@ace/mongoModel'
 *     - import type { InferMongoModel } from '@ace/mongoModel'
 */


import mongoose, { model, Model, type Schema, type InferSchemaType } from 'mongoose'


/** Create a mongodb model */
export class MongoModel<TSchema extends Schema, TInfer = InferSchemaType<TSchema> & { _id: string }> {
  name: string
  schema: TSchema

  private constructor(name: string, schema: TSchema) {
    this.name = name
    this.schema = schema
  }

  static Create<TSchema extends Schema>(name: string, schema: TSchema) {
    return new MongoModel<TSchema, InferSchemaType<TSchema> & { _id: string }>(name, schema)
  }

  get(): Model<TInfer> {
    return (mongoose.connection.models[this.name] as Model<TInfer>) || model<TInfer>(this.name, this.schema)
  }
}


/**
 * - Go from a model to the inferred schema
 * - IF "T" is a "Model" THEN set "U" to Model's 2nd type, which is the infered type of this.schema, aka InferSchemaType<typeof this.schema>
 */
export type InferMongoModel<T extends MongoModel<any, any>> = T extends MongoModel<any, infer U> ? U : never



/** Helps create a type-safe mongoose projection for schema fields */
export type MongoProjection<T> = { [K in keyof T]?: 0 | 1 }
