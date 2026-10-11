# Verification — user token `expires_at`

## Summary of change

Replaced the "derive expiration from `created_at` + a constant" approach for user tokens with a persisted absolute
`expires_at` timestamp.

- `UserToken` entity and `CreateUserToken` / `UpdateUserToken` DTOs now carry `expires_at: Date`.
- Mongo schema: dropped the TTL `expires` option on `created_at`, added `expires_at: { type: Date, required: true }` and
  a TTL index `UserTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })`. The unused `env` import was
  removed; the `user_id + type` unique index is unchanged.
- Services compute `expires_at` at creation time via
  `dateProvider.addSecondsToCurrentTime(env.USER_TOKEN_EXPIRES_IN_SECONDS)`.
- Expiration checks now use `dateProvider.isExpiredDate(token.expires_at)`. The duplicated private `isTokenExpired`
  helpers were deleted from `ConfirmEmail`, `ResetPassword`, `CreateUser`, and `ForgotPassword` services.
  `ResendEmailVerification` no longer inlines `addSeconds(... created_at)`.
- `SignupService` now receives `IDateProvider` (injected after `transactionManager`); its container and unit test were
  updated accordingly.
- No new date-provider method was added; existing `addSecondsToCurrentTime` and `isExpiredDate` are reused.
- The functional `isExpiredDate` checks remain because the Mongo TTL sweep is not immediate (TTL deletes at or after
  `expires_at`, not exactly on it).

## Commands run (from drunk-flavor-back)

1. Typecheck — `npm run typecheck` (`tsc --noEmit`): PASS, exit 0, no errors.
2. Targeted unit tests — `NODE_ENV=testing npx vitest run -c vitest.config.ts 'src/core/accounts/useCases'`: PASS, 16
   files / 53 tests.
3. Full unit suite — `npm test` (`NODE_ENV=testing vitest run -c vitest.config.ts`): PASS, 37 files / 144 tests.
4. Lint — `npm run lint` (`eslint .`): the only reported problems are pre-existing and unrelated to this task —
   `src/shared/helpers/deepUpdate.helper.ts`, `src/shared/helpers/query.helpers.ts`, and generated files under
   `coverage/`. None of the files changed for this task reported lint problems.

## Not run

E2e tests (`test:e2e`) require a live Mongo/Redis and were not executed here. The two e2e spec files touched
(`confirmEmail.e2e-spec.ts`, `resetPassword.e2e-spec.ts`) typecheck cleanly and now pass `expires_at` on token creation.
