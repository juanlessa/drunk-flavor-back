import 'dotenv/config';
import { envSchema } from './env.schema';

const _env = envSchema.parse(process.env);

export const env = _env;
