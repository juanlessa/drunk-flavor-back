import { DeepPartial } from '@/shared/types/utility.types';
import { instanceOfMongoObjectId } from '../infra/mongo/mongo.helpers';

/**
 * Recursively updates properties of an object with values from a partial update object.
 *
 * This function performs a deep update of the `currentRecord` object with values from the `newRecord` object.
 * For each property in `newRecord`, if the property exists and is an object, the function will recursively
 * update the nested properties. If the property is not an object or does not exist in `newRecord`,
 * the function will retain the original value from `currentRecord`.
 *
 * @param newRecord - A partial object containing new values to update `currentRecord`.
 * @param currentRecord - The original object to be updated.
 * @returns The updated object with values from `newRecord`.
 *
 * @template T - The type of the object being updated.
 *
 * @example
 * const current = {
 *   user: {
 *     name: "Alice",
 *     address: {
 *       city: "Wonderland",
 *       zip: "12345"
 *     }
 *   }
 * };
 * const update = {
 *   user: {
 *     address: {
 *       city: "New Wonderland"
 *     }
 *   }
 * };
 * const result = deepUpdate(update, current);
 * console.log(result);
 * // Output:
 * // {
 * //   user: {
 * //     name: "Alice",
 * //     address: {
 * //       city: "New Wonderland",
 * //       zip: "12345"
 * //     }
 * //   }
 * // }
 */
export const deepUpdate = <T extends object>(newRecord: DeepPartial<T>, currentRecord: T): T => {
	return Object.entries(currentRecord).reduce((acc, [key, value]) => {
		const newKey = key as keyof T;
		const newValue = newRecord[newKey];

		if (newValue === undefined) {
			return { ...acc, [newKey]: value };
		}

		if (instanceOfMongoObjectId(newValue) || newValue instanceof Date) {
			return { ...acc, [newKey]: newValue };
		}
		if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
			return { ...acc, [newKey]: deepUpdate<typeof value>(newValue, value) };
		} else {
			return { ...acc, [newKey]: newValue };
		}
	}, {} as T);
};
