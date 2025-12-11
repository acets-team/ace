
// /** start solid types */
// // --- Solid Store Utilities (Unchanged) ---

// export type PickMutable<T> = {
//   [K in keyof T as (<U>() => U extends {
//     [V in K]: T[V];
//   } ? 1 : 2) extends <U>() => U extends {
//     -readonly [V in K]: T[V];
//   } ? 1 : 2 ? K : never]: T[K];
// }

// export type NotWrappable = string | number | bigint | symbol | boolean | Function | null | undefined | SolidStore.Unwrappable[keyof SolidStore.Unwrappable];

// export type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? {
//   [K in Extract<keyof T, `${number}`>]?: T[K];
// } : {
//   [x: number]: T[number];
// } : Partial<T>;

// export type ArrayFilterFn<T> = (item: T, index: number) => boolean;

// export type StorePathRange = {
//   from?: number;
//   to?: number;
//   by?: number;
// };

// // This is the magic type that handles ignoring undefined/null automatically
// export type W<T> = Exclude<T, NotWrappable>;

// // This handles array indices vs object keys
// export type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [never] ? never : [
//   T
// ] extends [readonly unknown[]] ? number : keyof T : keyof T;

// export type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;

// export declare namespace SolidStore {
//   interface Unwrappable {
//   }
// }

// /** end solid types */


// --- Core Solid Utilities ---

// 1. Unwrappable Type (Excludes primitives, null/undefined)
export type NotWrappable = string | number | bigint | symbol | boolean | Function | null | undefined | SolidStore.Unwrappable[keyof SolidStore.Unwrappable];
type W<T> = Exclude<T, NotWrappable>;

// 2. KeyOf (Handles array indices vs object keys)
export type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [never] ? never : [
  T
] extends [readonly unknown[]] ? number : keyof T : keyof T;

// 3. Mutable Key Of (Excludes readonly keys)
export type PickMutable<T> = {
  [K in keyof T as (<U>() => U extends {
    [V in K]: T[V];
  } ? 1 : 2) extends <U>() => U extends {
    -readonly [V in K]: T[V];
  } ? 1 : 2 ? K : never]: T[K];
}
export type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;

// 4. CustomPartial (Allows partial object updates and array/tuple indexing)
export type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? {
  [K in Extract<keyof T, `${number}`>]?: T[K];
} : {
  [x: number]: T[number];
} : Partial<T>;

// 5. StorePathRange and ArrayFilterFn (For array path filtering features)
export type ArrayFilterFn<T> = (item: T, index: number) => boolean;
export type StorePathRange = {
  from?: number;
  to?: number;
  by?: number;
};

// 6. Part (Defines all valid inputs for a path segment: Key, Key[], FilterFn, Range)
export type Part<T, K extends KeyOf<T> = KeyOf<T>> =
  | K
  | ([K] extends [never] ? never : readonly K[])
  | ([T] extends [readonly unknown[]] ? ArrayFilterFn<T[number]> | StorePathRange : never);

// 7. StoreSetter (Defines valid input for the final value: Value, Partial Value, or Setter Function)
export type StoreSetter<T, U extends PropertyKey[] = []> =
  | T
  | CustomPartial<T>
  | ((prevState: T, traversed: U) => T | CustomPartial<T>);

export declare namespace SolidStore {
  // Empty interface for types that should not be unwrapped by Solid's proxy system
  interface Unwrappable { }
}