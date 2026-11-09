import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { omitAuthorshipDeep } from './authorship.helpers';

describe('omitAuthorshipDeep', () => {
	it('removes the authorship from an object and from everything nested in it', () => {
		const snapshot = {
			name: 'Gin',
			created_by: 'alice',
			updated_by: 'bob',
			category: { name: 'Spirit', created_by: 'alice', updated_by: 'alice' },
			units: [
				{ name: 'ml', created_by: 'alice' },
				{ name: 'g', updated_by: 'bob' },
			],
		};

		expect(omitAuthorshipDeep(snapshot)).toEqual({
			name: 'Gin',
			category: { name: 'Spirit' },
			units: [{ name: 'ml' }, { name: 'g' }],
		});
	});

	it('goes through arrays of arrays', () => {
		expect(omitAuthorshipDeep([[{ created_by: 'alice', id: 1 }]])).toEqual([[{ id: 1 }]]);
	});

	it('does not change the value it receives', () => {
		const value = { created_by: 'alice', nested: { updated_by: 'bob' } };

		omitAuthorshipDeep(value);

		expect(value).toEqual({ created_by: 'alice', nested: { updated_by: 'bob' } });
	});

	it('keeps the fields that only look like authorship', () => {
		const value = { created_at: new Date(0), updated_at: new Date(1), createdBy: 'camel' };

		expect(omitAuthorshipDeep(value)).toEqual(value);
	});

	it('keeps dates and object ids as they are instead of copying them into plain objects', () => {
		const id = new Types.ObjectId();
		const date = new Date(0);

		const result = omitAuthorshipDeep({ _id: id, created_at: date, nested: { ids: [id] } });

		expect(result._id).toBe(id);
		expect(result.created_at).toBe(date);
		expect(result.nested.ids[0]).toBe(id);
	});

	it.each([null, undefined, 'text', 12, true])('returns %s as it is', (value) => {
		expect(omitAuthorshipDeep(value)).toBe(value);
	});

	it('returns an empty object and an empty array as they are', () => {
		expect(omitAuthorshipDeep({})).toEqual({});
		expect(omitAuthorshipDeep([])).toEqual([]);
	});
});
