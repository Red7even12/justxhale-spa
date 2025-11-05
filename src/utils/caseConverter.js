import { snakeCase } from 'lodash';

export function convertKeysToSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[snakeCase(key)] = convertKeysToSnakeCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}
