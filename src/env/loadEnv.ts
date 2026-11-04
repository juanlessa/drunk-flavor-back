import { config as loadDotenv } from 'dotenv';

/**
 * Conditional dotenv loader, imported for its side effect by every env module
 * instead of `dotenv/config`.
 *
 * The `.env` file holds development values (real Google/AWS credentials, S3
 * storage, long-lived token lifetimes). The e2e suite must never inherit those:
 * it runs the real application and the leaked `.env` values would otherwise
 * override the environment-derived defaults (for example `STORAGE_TYPE=s3`
 * would point the storage at the real bucket). The CI e2e job injects every
 * variable it needs directly into `process.env`, and local e2e runs rely on the
 * `e2e` defaults baked into the env schemas (managed Mongo/Redis/SMTP, placeholder
 * auth secrets), so no file needs to be read.
 *
 * `NODE_ENV` is read raw here, before any schema parsing, because dotenv has not
 * run yet. In the e2e flow `NODE_ENV=e2e` always comes from the shell (the
 * `test:e2e` script), so the check is reliable. Every other environment loads the
 * `.env` file exactly as before.
 *
 * Loading runs once as a module side effect (ES modules are evaluated a single
 * time regardless of how many env modules import this file), preserving the
 * original `dotenv/config` behavior: the file is loaded before any variable is
 * parsed.
 */
if (process.env.NODE_ENV !== 'e2e') {
	loadDotenv();
}
