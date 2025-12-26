import { pipe, unknown, transform, array, picklist, type ErrorMessage } from 'valibot'


/**
 * - Array search params can be like this `?include=httpMetadata` if one value is defined
 * - Or like this `?include=httpMetadata&include=customMetadata` if multiple values are defined
 * - Case 1 will give back a `string` for include
 * - Case 2 will give back an `array` for include
 * - If our validation requires an `array` it'll `fail` in case 1
 * - `vSearchParamsArray` transmutes the input into an `array` first and then does the `validation`
 * @param allowedValues The values allowed in the array
 * @param errorMessage Custom error message
 */
export function vSearchParamsArray<T extends string>(
  /** The values allowed in the array */
  allowedValues: T[],
  /** Custom error message */
  errorMessage?: ErrorMessage<any>
) {
  return pipe(
    unknown(), // accept unknown because SearchParams can be anything initially
    
    transform((input) => { // transumte input into an array into an array format
      if (typeof input === 'string') return [input]
      if (Array.isArray(input)) return input
      return []
    }),

    array( // validate array
      picklist(allowedValues, errorMessage),
      errorMessage
    )
  );
}
