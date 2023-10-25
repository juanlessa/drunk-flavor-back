import { docsDatabaseCommonInfoExample } from '@shared/docs/common.docs';
import { docsDatabaseCommonInfo } from '@shared/docs/common.docs';

export const docsUserTag = 'user';

export const docsUserExample = {
	...docsDatabaseCommonInfoExample,
	name: 'user',
	surname: 'test',
	email: 'user@test.com',
	role: 'admin'
};

export const docsUserDefinition = {
	type: 'object',
	properties: {
		...docsDatabaseCommonInfo,
		name: {
			type: 'string'
		},
		surname: { type: 'string' },
		email: { type: 'string' },
		role: { type: 'string' }
	},
	example: docsUserExample
};
