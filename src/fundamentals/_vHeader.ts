import { object, pipe, unknown, transform, type ObjectEntries } from 'valibot';

/**
 * vHeader: Validates HTTP headers case-insensitively.
 */
export function vHeader<T_Entries extends ObjectEntries>(entries: T_Entries) {
  // 1. Lowercase the keys defined by the developer in the schema
  const lowercaseEntries: ObjectEntries = {};
  for (const [key, schema] of Object.entries(entries)) {
    lowercaseEntries[key.toLowerCase()] = schema;
  }

  // 2. Build the pipeline: Start unknown -> Normalize to Lowercase -> Validate as Object
  return pipe(
    unknown(),
    transform((input) => {
      if (typeof input !== 'object' || input === null) return input;

      const normalized: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        // Normalize incoming request keys to lowercase
        normalized[key.toLowerCase()] = value;
      }
      return normalized;
    }),
    // 3. Now validate the normalized object against our lowercase entries
    object(lowercaseEntries)
  );
}