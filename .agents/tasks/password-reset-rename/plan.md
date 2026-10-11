# Implementation Plan: Password-Reset Route Rename & Relocation (option A)

Rename and relocate the password-reset route pair in `drunk-flavor-back`, standardizing to a nested-resource URL style
and co-locating both use cases under the `auth` domain. Work directly in the repo (no worktree). All code, comments, and
test descriptions MUST be in English.

## Verification commands (from package.json)

- Typecheck: `npm run typecheck` (`tsc --noEmit`) — expected: no errors.
- Unit tests (single run): `npm run test` (`NODE_ENV=testing vitest run -c vitest.config.ts`) — expected: all pass.
    - Targeted:
      `npm run test -- src/core/accounts/useCases/auth/requestPasswordReset src/core/accounts/useCases/auth/confirmPassword`
- Lint: `npm run lint` (`eslint .`) — expected: no errors.
- E2E (optional, needs Mongo + SMTP):
  `npm run test:e2e -- src/infrastructure/fastify/tests/auth/requestPasswordReset.e2e-spec.ts src/infrastructure/fastify/tests/auth/confirmPassword.e2e-spec.ts`.
  E2E requires MongoDB (managed by default) and a MailDev SMTP server; typecheck + unit + lint are the primary gates.

## Naming conventions (follow existing repo style)

- Service file: `PascalCase.service.ts` (e.g. `RequestPasswordReset.service.ts`).
- Everything else: `camelCase.<role>.ts` (controller, container, schema, dtos, spec).
- Folder: `camelCase` (e.g. `requestPasswordReset`, `confirmPassword`).
- Imports: prefer the `@/` alias used across the repo. `useCases/auth` and `useCases/profile` are at the same depth, so
  `@/`-prefixed absolute imports are unaffected by the move; only in-folder `./` imports change because the file names
  change.

## CRITICAL scope boundary — do NOT rename (preserved values)

These contain forgot/reset strings but are persisted/contract/frontend values. Leave exactly as-is:

- `TokenTypeEnum['forgot-password']` in `src/core/accounts/entities/userToken.entity.ts` — persisted token type. All
  services keep using it.
- `EMAIL_JOB_NAMES.forgotPassword: 'forgot-password'` in `src/shared/providers/queue/email/emailQueue.constants.ts` and
  its usage in `emailQueue.types.ts` — BullMQ job name.
- Email template: `src/shared/providers/template/implementations/views/forgotPassword.template.ts` (+ its `.spec.ts`),
  `forgotPasswordTemplate`, `ForgotPasswordProps` in `template.dtos.ts`, `ITemplateProvider.forgotPassword(...)` and its
  impl in `Mjml.provider.ts`. The renamed `RequestPasswordResetService` STILL calls
  `this.templateProvider.forgotPassword(...)`.
- `FRONTEND_PAGE_PATHS.resetPassword: '/reset-password'` in `src/shared/constants/frontend.constants.ts` — a FRONTEND
  path. The request-reset service keeps building the link with it.
- The `confirmPassword` FIELD inside the reset schema (`password === confirmPassword` refinement) is a request-body
  field name / API contract, NOT a use-case identifier. Keep that field literally named `confirmPassword` even though
  the use case is now `ConfirmPassword`.
- The `TokenTypeEnum['forgot-password']` usages in `deleteProfile.spec.ts` and `users/delete/deleteUser.spec.ts` are
  unrelated test setup — do not touch.

## Items

- [ ] 1. Rename use case A folder and files: `forgotPassword` -> `requestPasswordReset` (stays under `auth`). In
      `src/core/accounts/useCases/auth/`, rename the folder `forgotPassword/` to `requestPasswordReset/` (use `git mv`
      to preserve history), and rename files: `ForgotPassword.service.ts` -> `RequestPasswordReset.service.ts`;
      `forgotPassword.controller.ts` -> `requestPasswordReset.controller.ts`; `forgotPassword.container.ts` ->
      `requestPasswordReset.container.ts`; `forgotPassword.schema.ts` -> `requestPasswordReset.schema.ts`;
      `forgotPassword.dtos.ts` -> `requestPasswordReset.dtos.ts`; `forgotPassword.spec.ts` ->
      `requestPasswordReset.spec.ts`. Files: the 6 files above (renamed). Verify:
      `ls src/core/accounts/useCases/auth/requestPasswordReset` shows the 6 renamed files and the old folder is gone.

- [ ] 2. Update identifiers inside use case A. - `RequestPasswordReset.service.ts`: class `ForgotPasswordService` ->
      `RequestPasswordResetService`; import `ForgotPassword` -> `RequestPasswordReset` from
      `./requestPasswordReset.dtos`; error path tags `'ForgotPassword.service.1'`/`'.2'` ->
      `'RequestPasswordReset.service.1'`/`'.2'`. KEEP `TokenTypeEnum['forgot-password']`,
      `this.templateProvider.forgotPassword(...)`, and `FRONTEND_PAGE_PATHS.resetPassword`. -
      `requestPasswordReset.dtos.ts`: import `forgotPasswordSchema` -> `requestPasswordResetSchema` from
      `./requestPasswordReset.schema`; type `ForgotPasswordReqBody` -> `RequestPasswordResetReqBody`; type
      `ForgotPassword` -> `RequestPasswordReset`. - `requestPasswordReset.schema.ts`: const `forgotPasswordSchema` ->
      `requestPasswordResetSchema`. - `requestPasswordReset.controller.ts`: import `ForgotPasswordReqBody` ->
      `RequestPasswordResetReqBody` from `./requestPasswordReset.dtos`; import `resolveForgotPasswordService` ->
      `resolveRequestPasswordResetService` from `./requestPasswordReset.container`; const `forgotPasswordController` ->
      `requestPasswordResetController`. - `requestPasswordReset.container.ts`: import `ForgotPasswordService` ->
      `RequestPasswordResetService` from `./RequestPasswordReset.service`; const `forgotPasswordService` ->
      `requestPasswordResetService`; export `resolveForgotPasswordService` -> `resolveRequestPasswordResetService`. -
      `requestPasswordReset.spec.ts`: import `ForgotPasswordService` -> `RequestPasswordResetService` from
      `./RequestPasswordReset.service`; typed var and `new ...Service(...)` updated; `describe('ForgotPassword', ...)`
      -> `describe('RequestPasswordReset', ...)`; update `it(...)` descriptions mentioning "forgot password" to "request
      password reset". KEEP `TokenTypeEnum['forgot-password']` in test setup. Files: the 6 files from item 1. Verify:
      `npm run typecheck` passes; `npm run test -- src/core/accounts/useCases/auth/requestPasswordReset` passes.

- [ ] 3. Move use case B from `profile` to `auth` and rename: `profile/resetPassword` -> `auth/confirmPassword`.
      `git mv src/core/accounts/useCases/profile/resetPassword src/core/accounts/useCases/auth/confirmPassword`, then
      rename files: `ResetPassword.service.ts` -> `ConfirmPassword.service.ts`; `resetPassword.controller.ts` ->
      `confirmPassword.controller.ts`; `resetPassword.container.ts` -> `confirmPassword.container.ts`;
      `resetPassword.schema.ts` -> `confirmPassword.schema.ts`; `resetPassword.dtos.ts` -> `confirmPassword.dtos.ts`;
      `resetPassword.spec.ts` -> `confirmPassword.spec.ts`. All current imports in these files use the `@/` alias (no
      `../../` relative imports to re-point) plus in-folder `./` imports; the move keeps `@/` imports valid. Files: the
      6 files above (moved + renamed). Verify: `ls src/core/accounts/useCases/auth/confirmPassword` shows the 6 files;
      `src/core/accounts/useCases/profile/resetPassword` no longer exists.

- [ ] 4. Update identifiers inside use case B. - `ConfirmPassword.service.ts`: class `ResetPasswordService` ->
      `ConfirmPasswordService`; import `ResetPassword` -> `ConfirmPassword` from `./confirmPassword.dtos`; error path
      tags `'ResetPassword.service.1'`/`'.2'`/`'.3'` -> `'ConfirmPassword.service.1'`/`'.2'`/`'.3'`. -
      `confirmPassword.dtos.ts`: import `resetPasswordSchema` -> `confirmPasswordSchema` from
      `./confirmPassword.schema`; type `ResetPasswordReqBody` -> `ConfirmPasswordReqBody`; type `ResetPassword` ->
      `ConfirmPassword`. - `confirmPassword.schema.ts`: const `resetPasswordSchema` -> `confirmPasswordSchema`. KEEP the
      inner body field `confirmPassword` and the `password === confirmPassword` refinement exactly as-is (API contract
      field, not an identifier rename). - `confirmPassword.controller.ts`: import `ResetPasswordReqBody` ->
      `ConfirmPasswordReqBody` from `./confirmPassword.dtos`; import `resolveResetPasswordService` ->
      `resolveConfirmPasswordService` from `./confirmPassword.container`; const `resetPasswordController` ->
      `confirmPasswordController`. - `confirmPassword.container.ts`: import `ResetPasswordService` ->
      `ConfirmPasswordService` from `./ConfirmPassword.service`; const `resetPasswordService` ->
      `confirmPasswordService`; export `resolveResetPasswordService` -> `resolveConfirmPasswordService`. -
      `confirmPassword.spec.ts`: import `ResetPasswordService` -> `ConfirmPasswordService` from
      `./ConfirmPassword.service`; typed var and `new ...Service(...)` updated; `describe('Reset Password', ...)` ->
      `describe('Confirm Password', ...)`; update `it(...)` descriptions mentioning "reset the password" to "confirm
      password" wording. KEEP `TokenTypeEnum['forgot-password']` in test setup. Files: the 6 files from item 3. Verify:
      `npm run typecheck` passes; `npm run test -- src/core/accounts/useCases/auth/confirmPassword` passes.

- [ ] 5. Update `auth.routes.ts`: change the request route path + imports, and add the confirm route. In
      `src/infrastructure/fastify/routes/auth.routes.ts`: - Replace imports
      `forgotPasswordSchema`/`forgotPasswordController` from `.../auth/forgotPassword/...` with
      `requestPasswordResetSchema`/`requestPasswordResetController` from
      `@/core/accounts/useCases/auth/requestPasswordReset/requestPasswordReset.schema` and
      `.../requestPasswordReset.controller`. - Change the existing `POST '/forgot-password'` registration to
      `POST '/password-reset/request'`, body `requestPasswordResetSchema`, handler `requestPasswordResetController`,
      `summary: 'Request Password Reset'`, `description: 'Sends a password reset link to the user email'`, tags
      `['Auth']`. - Add imports for `confirmPasswordSchema`/`confirmPasswordController` from
      `@/core/accounts/useCases/auth/confirmPassword/...` and register `POST '/password-reset/confirm'`: body
      `confirmPasswordSchema`, handler `confirmPasswordController`, tags `['Auth']`,
      `summary: 'Confirm Password Reset'`, `description: 'Sets a new password using the password reset token'`. Files:
      `src/infrastructure/fastify/routes/auth.routes.ts`. Verify: `npm run typecheck` passes.

- [ ] 6. Update `profile.routes.ts`: remove the reset-password route and its now-unused imports. In
      `src/infrastructure/fastify/routes/profile.routes.ts`, delete the `POST '/reset-password'` registration block and
      the imports `resetPasswordSchema` and `resetPasswordController`. Leave `/me` (GET/PATCH/DELETE) and
      `/update-password` untouched. Files: `src/infrastructure/fastify/routes/profile.routes.ts`. Verify:
      `npm run typecheck` passes; `npm run lint` passes (no unused-import errors).

- [ ] 7. Move + update the confirm e2e spec: `profile/resetPassword.e2e-spec.ts` -> `auth/confirmPassword.e2e-spec.ts`.
      `git mv src/infrastructure/fastify/tests/profile/resetPassword.e2e-spec.ts src/infrastructure/fastify/tests/auth/confirmPassword.e2e-spec.ts`.
      The relative import `../helpers/authentication.helpers` is unchanged (both `profile/` and `auth/` are one level
      under `tests/`). Update request path `.post('/reset-password')` -> `.post('/password-reset/confirm')`; update
      `describe('Reset Password', ...)` -> `describe('Confirm Password', ...)`. KEEP `TokenTypeEnum['forgot-password']`
      and the `expires_at` field it passes. Files: `src/infrastructure/fastify/tests/auth/confirmPassword.e2e-spec.ts`
      (moved). Verify: `npm run typecheck` passes; file exists at new path, old path gone.

- [ ] 8. Rename + update the request e2e spec: `auth/forgotPassword.e2e-spec.ts` ->
      `auth/requestPasswordReset.e2e-spec.ts`.
      `git mv src/infrastructure/fastify/tests/auth/forgotPassword.e2e-spec.ts src/infrastructure/fastify/tests/auth/requestPasswordReset.e2e-spec.ts`.
      Update request path `.post('/forgot-password')` -> `.post('/password-reset/request')`; update
      `describe('Forgot Password', ...)` -> `describe('Request Password Reset', ...)`. Files:
      `src/infrastructure/fastify/tests/auth/requestPasswordReset.e2e-spec.ts` (renamed). Verify: `npm run typecheck`
      passes.

- [ ] 9. Full verification + grep assertions. Run `npm run typecheck`, `npm run test`, and `npm run lint` — all must
      pass. Then confirm ZERO matches in application code (`src/`) for the renamed identifiers and old route strings,
      EXCEPT the deliberately-preserved items. Run from repo root: -
      `grep -rn "ForgotPasswordService\|resolveForgotPasswordService\|forgotPasswordController\|forgotPasswordSchema" src`
      -> 0 matches. -
      `grep -rn "ResetPasswordService\|resolveResetPasswordService\|resetPasswordController\|resetPasswordSchema" src`
      -> 0 matches. - `grep -rn "'/forgot-password'\|'/reset-password'" src` -> 0 matches (route strings gone;
      `/password-reset/request` and `/password-reset/confirm` present instead). -
      `grep -rn "useCases/auth/forgotPassword\|useCases/profile/resetPassword" src` -> 0 matches. Preserved (these grep
      hits are EXPECTED and must remain): `TokenTypeEnum['forgot-password']`, `EMAIL_JOB_NAMES.forgotPassword`,
      `forgotPasswordTemplate`, `ForgotPasswordProps`, `ITemplateProvider.forgotPassword`,
      `templateProvider.forgotPassword(...)`, `FRONTEND_PAGE_PATHS.resetPassword`, `forgotPassword.template.ts`, and the
      `confirmPassword` body FIELD inside the schema. Files: none (verification only). Verify: all three npm commands
      pass and all grep assertions hold.

## Notes / assumptions

- `dateProvider.isExpiredDate(...)` already exists and is used by both services; there are no private `isExpired`
  methods left to remove (that refactor was done in an earlier task). No DateProvider change is needed for this task.
- No barrel/index files re-export these use cases; a full-repo grep found references only in the files listed above.
  Updating those files is sufficient.
- The repo currently has unrelated uncommitted changes on `develop` (prior task artifacts, README/TODO edits). Stage
  only the files this task touches when committing.
