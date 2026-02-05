/**
 * Convert a whole object (or array of objects) whose property names are in
 * snake_case to a new structure whose keys are camelCase.
 */
export function convertToCamelCase<T = unknown>(input: unknown): T {
  // Primitive values (string, number, boolean, null, Date, RegExp, …)
  if (
    input === null ||
    typeof input !== 'object' ||
    input instanceof Date ||
    input instanceof RegExp ||
    input instanceof Map ||
    input instanceof Set
  ) {
    return input as T;
  }

  // Arrays – map each element through the same conversion
  if (Array.isArray(input)) {
    return input.map((item) => convertToCamelCase(item)) as unknown as T;
  }

  // Plain objects – transform each key
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    //if nested objects or arrays convert them too
    result[camelKey] = convertToCamelCase(value);
  }

  return result as T;
}