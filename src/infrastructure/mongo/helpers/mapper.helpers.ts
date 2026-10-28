import { Types } from 'mongoose';
import { MONGO_INTERNAL_FIELDS } from '../constants/mapper.constants';
import { DeepMapOptions, EntryMapper, NullHandling } from '../types/mapper.types';

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	if (value === null || typeof value !== 'object') {
		return false;
	}
	const prototype = Reflect.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
};

export const toMongoUpdateSet = (source: Record<string, unknown>, prefix = ''): Record<string, unknown> =>
	Object.entries(source).reduce<Record<string, unknown>>((update, [key, value]) => {
		if (value === undefined) {
			return update;
		}

		const path = prefix ? `${prefix}.${key}` : key;
		if (isPlainObject(value)) {
			return { ...update, ...toMongoUpdateSet(value, path) };
		}

		return { ...update, [path]: value };
	}, {});

const normalizeNull = (value: unknown, nullHandling: NullHandling): unknown =>
	value === null && nullHandling !== 'preserve' ? undefined : value;

const mapValueDeep = (value: unknown, mapEntry: EntryMapper, options: Required<DeepMapOptions>): unknown => {
	const normalizedValue = normalizeNull(value, options.nullHandling);
	if (Array.isArray(normalizedValue)) {
		return normalizedValue.map((item) => mapValueDeep(item, mapEntry, options));
	}
	return isPlainObject(normalizedValue) ? mapObjectEntriesDeep(normalizedValue, mapEntry, options) : normalizedValue;
};

export const mapObjectEntriesDeep = (
	source: Record<string, unknown>,
	mapEntry: EntryMapper,
	{ nullHandling = 'preserve' }: DeepMapOptions = {},
): Record<string, unknown> => {
	const options = { nullHandling };
	return Object.fromEntries(
		Object.entries(source).flatMap(([key, value]) => {
			if (nullHandling === 'omit' && value == null) {
				return [];
			}
			const entry = mapEntry(key, normalizeNull(value, nullHandling));
			if (!entry) {
				return [];
			}
			const [mappedKey, mappedValue] = entry;
			return [[mappedKey, mapValueDeep(mappedValue, mapEntry, options)] as const];
		}),
	);
};

export const toSnakeCase = (value: string): string =>
	value
		.replace(/([a-z\d])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
		.toLowerCase();

export const toCamelCase = (value: string): string =>
	value.replace(/_([a-z\d])/g, (_, character: string) => character.toUpperCase());

export const toObjectId = (id: string): Types.ObjectId | null =>
	Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;

export const requireObjectId = (id: unknown): Types.ObjectId => {
	if (typeof id !== 'string') {
		throw new TypeError('Document id must be a string');
	}
	const objectId = toObjectId(id);
	if (!objectId) {
		throw new TypeError('Document id must be a valid ObjectId');
	}
	return objectId;
};

export const toPlainObject = <T extends object>(document: T): Record<string, unknown> => {
	const documentWithToObject = document as T & {
		toObject?: (options?: Record<string, unknown>) => unknown;
	};
	if (typeof documentWithToObject.toObject === 'function') {
		return documentWithToObject.toObject({
			getters: false,
			virtuals: false,
			versionKey: false,
		}) as Record<string, unknown>;
	}
	return document as unknown as Record<string, unknown>;
};

export const isMongoInternalField = (field: string): boolean =>
	MONGO_INTERNAL_FIELDS.has(field) || field.startsWith('$');

export const toDomainEntry: EntryMapper = (key, value) => {
	if (isMongoInternalField(key)) {
		return undefined;
	}
	if (key === '_id') {
		if (value instanceof Types.ObjectId) {
			return ['id', value.toHexString()];
		}
		if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
			return ['id', new Types.ObjectId(value).toHexString()];
		}
		throw new TypeError('Persisted document _id must be a valid ObjectId');
	}
	return [toCamelCase(key), value];
};

export const toPersistenceEntry: EntryMapper = (key, value) => {
	if (key === 'id') {
		return ['_id', requireObjectId(value)];
	}
	return [toSnakeCase(key), value];
};

export const mapQueryFields = <T>(fields: Record<string, T> | undefined): Record<string, T> | undefined =>
	fields
		? Object.fromEntries(
				Object.entries(fields).map(([field, value]) => [field === 'id' ? '_id' : toSnakeCase(field), value]),
			)
		: undefined;
