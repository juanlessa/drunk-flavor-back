# Env decoupling: local `parseXEnv` instead of aggregated `env`

## Goal

Refactor standalone modules so each imports only the specific per-domain `parseXEnv` parser(s) for the variables it
actually uses, instead of the aggregated singleton `env` from `@/env`. Parsed values are identical to what `env.X`
returned; the only change is the source (a local parse-once const). No runtime behavior change.

Each edited module calls its parser once at module top-level and stores it in a const, preserving parse-once semantics
(never re-parsing inside functions / hot paths).

## Files changed and parser substituted

| File                                                                          | Parser                                 | Mapping                                                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/shared/constants/mailer.constants.ts`                                    | `parseSmtpEnv` -> `const smtp`         | `env.SMTP_DOMAIN` -> `smtp.SMTP_DOMAIN`                                                           |
| `src/shared/providers/cryptography/implementations/BcryptHash.provider.ts`    | `parseAuthEnv` -> `const auth`         | `env.PASSWORD_HASH_ROUNDS` -> `auth.PASSWORD_HASH_ROUNDS`                                         |
| `src/shared/providers/mailer/implementations/nodemailerTransporter.helper.ts` | `parseSmtpEnv` -> `const smtp`         | `env.SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD` -> `smtp.*`                                 |
| `src/shared/providers/mailer/implementations/Nodemailer.provider.ts`          | none                                   | removed the unused `import { env } from '@/env'` (no `env.X` reference existed)                   |
| `src/infrastructure/redis/RedisConnection.ts`                                 | `parseRedisEnv` -> `const redis`       | connection keys + `REDIS_CONNECT_TIMEOUT_MS` (see narrowing below)                                |
| `src/infrastructure/bullmq/BullMQConnection.ts`                               | `parseBullmqEnv` -> `const bullmq`     | connection keys + `BULLMQ_REDIS_CONNECT_TIMEOUT_MS` (see narrowing below)                         |
| `src/infrastructure/bullmq/workers/email/emailWorker.container.ts`            | `parseBullmqEnv` -> `const bullmq`     | `env.EMAIL_WORKER_CONCURRENCY` -> `bullmq.EMAIL_WORKER_CONCURRENCY` (both branches, no narrowing) |
| `src/worker.ts`                                                               | `parseNodeEnv` -> `const { NODE_ENV }` | `env.NODE_ENV` -> `NODE_ENV` in the load log                                                      |
| `src/infrastructure/mongo/helpers/mongoose.helpers.ts`                        | `parseMongoEnv` -> `const mongoEnv`    | pass `mongoEnv` into both schema `.parse(...)` calls instead of `env`                             |
| `src/infrastructure/vitest/e2e/setup.ts`                                      | `parseControlEnv` -> `const control`   | `env.MONGO_MODE` -> `control.MONGO_MODE`                                                          |
| `src/infrastructure/vitest/e2e/globalSetup.ts`                                | `parseControlEnv` -> `const control`   | `env.MONGO_MODE` -> `control.MONGO_MODE`, `env.REDIS_MODE` -> `control.REDIS_MODE`                |

## Discriminated-union narrowing (redis / bullmq)

`parseRedisEnv` and `parseBullmqEnv` return a discriminated union on `REDIS_MODE` (`managed` | `external`). The
connection keys (`HOST/PORT/USERNAME/PASSWORD/DATABASE`) live only on the `external` branch; the timeout key
(`REDIS_CONNECT_TIMEOUT_MS` / `BULLMQ_REDIS_CONNECT_TIMEOUT_MS`) is present on both branches.

Handling in both `buildRedisUrl` helpers:

- Narrow on `REDIS_MODE === 'external'` to read the connection keys.
- In the non-`external` (managed) case, fall back to the exact same defaults the aggregated `env` previously backfilled
  (`host: 'localhost'`, `port: 6379`, `username: ''`, `password: ''`, `database: 0`). This keeps the produced URL
  byte-identical to the previous behavior in managed mode. In practice these connections are only meaningfully used in
  `external` mode (managed/test mode passes an explicit `url` to `start()`), so the fallback is a behavior- preserving
  safety net rather than a new code path.
- The timeout value is read WITHOUT narrowing (present on both branches), identical to before.

Net effect: `buildRedisUrl` output and the `socket.connectTimeout` value are identical to the previous aggregated-`env`
behavior in every mode.

## mongoose.helpers.ts decision: CONVERTED

Converted to `parseMongoEnv`. Reasoning:

- `mongoConnectionStringSchema` requires non-empty `MONGO_PROTOCOL`, `MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_HOST`,
  `MONGO_PORT`, `MONGO_DATABASE`, `MONGO_PARAMS`. The aggregated `env` backfills these flat keys with EMPTY strings in
  `managed` mode (`EMPTY_MONGO_CONNECTION_KEYS`), so `mongoConnectionStringSchema.parse(env)` already throws in managed
  mode (empty strings fail `min(1)`). This confirms `buildConnectionStringFromEnv` is only exercised in `external` mode.
- In `external` mode, `parseMongoEnv()` returns the full external branch with every `MONGO_*` key carrying the same
  values the aggregated `env` exposed, so both `.parse(...)` calls receive identical input and produce identical output.
- `mongooseConnectionOptionsSchema` reads only the connection-option keys (`MONGO_MAX_POOL_SIZE`,
  `MONGO_CONNECT_TIMEOUT_MS`, `MONGO_SERVER_SELECTION_TIMEOUT_MS`), which exist on BOTH mongo branches, so that parse is
  identical in every mode.
- Zod `.parse()` accepts `unknown`, so passing the discriminated union typechecks cleanly (verified below). The only
  edge is managed mode, where `mongoConnectionStringSchema.parse` throws regardless of source (aggregated `env` or
  `parseMongoEnv`) — behavior preserved (both throw; it is never reached in a working managed deployment).

## Untouched / exempt areas (left exactly as-is)

- `src/core/**`
- `src/server.ts`
- `src/infrastructure/fastify/**`
- `src/shared/providers/storage/**` (both `index.ts` and `implementations/S3Storage.provider.ts`) — the user handles
  storage separately.

An unrelated prettier reformat that `npm run format` applied to `src/shared/accessControl/types/index.ts` (a
pre-existing formatting drift, not part of this task) was reverted so the commit stays scoped to the intended edits.

## Verification results

Run in the worktree `/Users/juanlessa/Documents/personal/drunk-flavor-back/.worktrees/env-decouple`.

- `npm run format` — ran; only the intended edited files were (re)formatted (an unrelated reformat of
  `accessControl/types/index.ts` was reverted).
- `npm run typecheck` — 1 error, PRE-EXISTING and unrelated:
  `src/shared/providers/mailer/implementations/MockMailer.provider.ts(6,2): error TS2883`. Confirmed identical on clean
  HEAD (stashed the changes and re-ran). None of the edited files produce a typecheck error. No NEW errors.
- `npm run lint` — 9 errors, all PRE-EXISTING and unrelated, in `src/shared/helpers/deepUpdate.helper.ts` and
  `src/shared/helpers/query.helpers.ts` (`@typescript-eslint/no-unsafe-*`). Confirmed present on clean HEAD. None of the
  edited files produce a lint error. No NEW errors.
- `npm run build` — success (`dist/server.js`).
- `npm run worker:build` — success (`dist/worker.js`).
- `npm run test` — green: 37 test files passed, 144 tests passed.

`dist/` and `node_modules` are gitignored and not staged. No temporary files created.
