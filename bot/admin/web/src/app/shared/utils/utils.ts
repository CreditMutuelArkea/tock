/**
 * Makes a deep copy of the object. (types and circular dependencies are not preserved).
 * @param {Object} obj Object to copy
 * @returns {Object} copy of the object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Evaluate if argument is of primitive type.
 * @param {any} arg variable to evaluate
 * @returns {boolean} return true if arg is a primitive
 */
export function isPrimitive(arg: any): boolean {
  var type = typeof arg;
  return arg == null || (type != 'object' && type != 'function');
}
