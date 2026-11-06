import { config as loadDotenv } from 'dotenv';

/**
 * Conditional dotenv loader, imported for its side effect by every env module
 * instead of `dotenv/config`.
 *
 * The `testing` environment never reads the `.env` file. It is self-contained:
 * unit and integration rely on the env-schema defaults plus the values Vitest
 * injects through `test.env` and `provide`/`inject`, and the e2e suite (which
 * also runs under `NODE_ENV=testing`) relies on the schema defaults (managed
 * Mongo/Redis/SMTP, placeholder auth secrets) plus whatever the CI job injects
 * into `process.env`. Loading the `.env` there would leak development values
 * into the suites — for example `STORAGE_TYPE=s3` would point the storage at the
 * real bucket, and the real Google/AWS credentials would override the schema
 * placeholders.
 *
 * `NODE_ENV` is read raw here, before any schema parsing, because dotenv has not
 * run yet. In the test flows `NODE_ENV` always comes from the shell (the `test*`
 * scripts) or from Vitest `test.env`, so the check is reliable. Development and
 * production load the `.env` file exactly as before.
 *
 * Loading runs once as a module side effect (ES modules are evaluated a single
 * time regardless of how many env modules import this file), preserving the
 * original `dotenv/config` behavior: the file is loaded before any variable is
 * parsed.
 */
if (process.env.NODE_ENV !== 'testing') {
	loadDotenv();
}
