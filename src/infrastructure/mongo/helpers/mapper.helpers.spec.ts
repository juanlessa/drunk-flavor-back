import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	requireObjectId,
	toCamelCase,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toSnakeCase,
} from './mapper.helpers';

describe('Mongo mapper helpers', () => {
	it('converts project-style camelCase and snake_case names bidirectionally', () => {
		expect(toSnakeCase('emailVerified')).toBe('email_verified');
		expect(toSnakeCase('providerUrl')).toBe('provider_url');
		expect(toCamelCase('email_verified')).toBe('emailVerified');
		expect(toCamelCase('provider_url')).toBe('providerUrl');
	});

	it('maps nested objects and arrays deeply while preserving non-plain values', () => {
		const createdAt = new Date();
		const ownerId = new Types.ObjectId();
		const buffer = Buffer.from('avatar');
		const metadata = new Map([['image_url', 'preserved']]);
		const mapped = mapObjectEntriesDeep(
			{
				profile_data: {
					display_name: 'Jane',
					items: [[{ image_url: 'https://example.com/avatar.png' }]],
					__v: 1,
					$locals: { hidden_value: true },
				},
				created_at: createdAt,
				owner_id: ownerId,
				buffer_value: buffer,
				metadata,
			},
			toDomainEntry,
		);

		expect(mapped).toMatchObject({
			profileData: {
				displayName: 'Jane',
				items: [[{ imageUrl: 'https://example.com/avatar.png' }]],
			},
			createdAt,
			ownerId,
			bufferValue: buffer,
			metadata,
		});
		expect(mapped.profileData).not.toHaveProperty('__v');
		expect(mapped.profileData).not.toHaveProperty('$locals');
		expect(mapped.createdAt).toBe(createdAt);
		expect(mapped.ownerId).toBe(ownerId);
		expect(mapped.bufferValue).toBe(buffer);
		expect(mapped.metadata).toBe(metadata);
	});

	it('supports deep null policies without changing the shared default', () => {
		const preserve = mapObjectEntriesDeep({ symbol: null }, toPersistenceEntry);
		const omit = mapObjectEntriesDeep(
			{ symbol: null, optionalValue: undefined, nestedValue: { childValue: null }, items: [null] },
			toPersistenceEntry,
			{ nullHandling: 'omit' },
		);
		const toUndefined = mapObjectEntriesDeep(
			{ optional_value: null, nested_value: { child_value: null }, items: [null] },
			toDomainEntry,
			{ nullHandling: 'toUndefined' },
		);

		expect(preserve).toEqual({ symbol: null });
		expect(omit).toEqual({ nested_value: {}, items: [undefined] });
		expect(toUndefined).toEqual({
			optionalValue: undefined,
			nestedValue: { childValue: undefined },
			items: [undefined],
		});
	});

	it('maps id and _id using real ObjectId values', () => {
		const id = new Types.ObjectId();
		const persistence = mapObjectEntriesDeep({ id: id.toHexString() }, toPersistenceEntry);
		const domain = mapObjectEntriesDeep({ _id: id }, toDomainEntry);

		expect(persistence._id).toBeInstanceOf(Types.ObjectId);
		expect((persistence._id as Types.ObjectId).equals(id)).toBe(true);
		expect(domain).toEqual({ id: id.toHexString() });
		expect(toObjectId(id.toHexString())?.equals(id)).toBe(true);
		expect(toObjectId('invalid')).toBeNull();
		expect(() => requireObjectId('invalid')).toThrow(TypeError);
	});

	it('maps sort field names while preserving values', () => {
		expect(mapQueryFields({ id: -1, createdAt: 1, emailVerified: 'desc' })).toEqual({
			_id: -1,
			created_at: 1,
			email_verified: 'desc',
		});
	});
});
