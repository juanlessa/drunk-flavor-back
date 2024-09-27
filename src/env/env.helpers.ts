import { ZodTypeAny } from 'zod';
import { NodeEnv } from './env.types';

export const schemaDefaultBasedOnNodeEnv = <T extends ZodTypeAny>(
	schema: T,
	...configs: { defaultValue: T['_type']; environments: NodeEnv[] }[]
) => {
	const currentEnv = (process.env.NODE_ENV as NodeEnv) || 'development';

	for (const { defaultValue, environments } of configs) {
		if (environments.includes(currentEnv)) {
			return schema.default(defaultValue);
		}
	}
	return schema;
};
