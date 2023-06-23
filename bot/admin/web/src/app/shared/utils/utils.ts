import { saveAs } from 'file-saver-es';

export interface OrderBy {
  criteria: string;
  reverse: boolean;
  secondField?: string;
}

/**
 * Return an array of elements ordered according to the specified criteria
 * @param {Array<T>} array array of objects of the same type
 * @param {string} field object key used as sorting criteria
 * @param {boolean} reverse sort order, ascending or descending
 * @param {string} secondField object key used as sorting criteria, used in case the values of the first criterion are equal
 * @returns {Array<T>}
 */
export function orderBy<T>(array: T[], field: string, reverse: boolean = false, secondField?: string): T[] {
  if (!Array.isArray(array)) {
    throw new TypeError('invalid array argument. The parameter must be an array');
  }

  if (!array.every((v: T) => typeof v === 'object' && v !== null && !Array.isArray(v))) {
    throw new TypeError('invalid array argument. The array must contain only objects');
  }

  if (!field) {
    throw new Error('the field parameter cannot be empty');
  }

  const sortedArray = [...array].sort((a: T, b: T) => {
    if (a[field] == null || a[field] == '') return 1;

    if (b[field] == null || b[field] == '') return -1;

    if (secondField) {
      return a[field].localeCompare(b[field]) || a[secondField].localeCompare(b[secondField]);
    }
    return a[field].localeCompare(b[field]);
  });

  return reverse ? sortedArray.reverse() : sortedArray;
}

export function readFileAsText(file: File): Promise<any> {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader();

    fr.onload = function () {
      resolve({ fileName: file.name, data: fr.result });
    };

    fr.onerror = function () {
      reject(fr);
    };

    fr.readAsText(file);
  });
}

export function exportJsonDump(obj: Object, fileName: string): void {
  saveAs(
    new Blob([JSON.stringify(obj)], {
      type: 'application/json'
    }),
    fileName + '.json'
  );
}

/**
 * Makes a deep copy of the object. (types and circular dependencies are not preserved).
 * TODO: replace with the structuredClone method when the project dependencies have been upgraded
 * @param {Object} obj
 * @returns {Object} copy of the object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isPrimitive(arg) {
  var type = typeof arg;
  return arg == null || (type != 'object' && type != 'function');
}
