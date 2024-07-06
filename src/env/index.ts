import 'dotenv/config';
import { envSchema } from './env.schema';
import { DEFAULT_DEVELOPMENT_ENV, DEFAULT_PRODUCTION_ENV, DEFAULT_TESTING_ENV } from './env.constants';
import { match } from 'ts-pattern';
import { EnvType } from './env.types';

const { NODE_ENV } = process.env;

const defaultsBasedOnNodeEnv = match(NODE_ENV)
	.with('production', () => DEFAULT_PRODUCTION_ENV)
	.with('e2e', () => DEFAULT_PRODUCTION_ENV)
	.with('testing', () => DEFAULT_TESTING_ENV)
	.otherwise(() => DEFAULT_DEVELOPMENT_ENV);

let _env: EnvType = envSchema.parse({ ...defaultsBasedOnNodeEnv, ...process.env });

export const env = _env;
