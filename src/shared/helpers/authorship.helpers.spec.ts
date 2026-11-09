import { describe, expect, it } from 'vitest';
import { omitAuthorship } from './authorship.helpers';

describe('omitAuthorship', () => {
	it('removes who created and who last edited the record, keeping the rest', () => {
		const record = { id: '1', name: 'Gin', createdBy: 'alice', updatedBy: 'bob', createdAt: new Date(0) };

		const result = omitAuthorship(record);

		expect(result).toEqual({ id: '1', name: 'Gin', createdAt: new Date(0) });
		expect(result).not.toHaveProperty('createdBy');
		expect(result).not.toHaveProperty('updatedBy');
	});

	it('does not change the record it receives', () => {
		const record = { id: '1', createdBy: 'alice', updatedBy: 'bob' };

		omitAuthorship(record);

		expect(record).toEqual({ id: '1', createdBy: 'alice', updatedBy: 'bob' });
	});

	it('returns a copy of a record that has no authorship', () => {
		const record: { id: string; createdBy?: string } = { id: '1' };

		const result = omitAuthorship(record);

		expect(result).toEqual(record);
		expect(result).not.toBe(record);
	});

	it('removes only one of them when the other is missing, e.g. after the account of the creator was closed', () => {
		const onlyEditor: { id: string; createdBy?: string; updatedBy?: string } = { id: '1', updatedBy: 'bob' };
		const onlyCreator: { id: string; createdBy?: string; updatedBy?: string } = { id: '1', createdBy: 'alice' };

		expect(omitAuthorship(onlyEditor)).toEqual({ id: '1' });
		expect(omitAuthorship(onlyCreator)).toEqual({ id: '1' });
	});

	it('keeps the nested records as they are', () => {
		const nested = { id: '2', createdBy: 'alice' };

		expect(omitAuthorship({ id: '1', createdBy: 'alice', nested })).toEqual({ id: '1', nested });
	});
});
