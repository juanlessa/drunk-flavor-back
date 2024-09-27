import 'dotenv/config';
import { envSchema } from './env.schema';

let _env = envSchema.parse(process.env);

export const env = _env;
