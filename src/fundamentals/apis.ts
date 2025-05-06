
/**
 * - This file lives in your TS “paths” for @ace/apis, but never actually runs
 * - At build time Vite will alias @ace/apis → either fe.ts or be.ts
 * - Thanks to this editors get FE types and will autosuggest this file which is correct
 */
export * from '../apis.fe'