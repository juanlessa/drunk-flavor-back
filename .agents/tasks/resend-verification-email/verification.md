# Resend verification email via BullMQ

## Summary of change

The `ResendEmailVerification` use case previously created a fresh email-verification token but ended with a placeholder
comment and never dispatched the email. The BullMQ email queue provider is now fully implemented and already used by
`SignupService`, so the queueing logic was implemented here by mirroring `SignupService`.

### Service (`ResendEmailVerification.service.ts`)

- Added two constructor dependencies after the existing ones: `templateProvider` (`ITemplateProvider`) and
  `emailQueueProvider` (`IEmailQueueProvider`).
- Replaced the placeholder comment on the success path with:
    - building the HTML via `templateProvider.emailVerification({ userName, verificationLink })`, using the plaintext
      `token` in the link (`FRONTEND_BASE_URL` + `FRONTEND_PAGE_PATHS.verifyEmail`);
    - enqueueing via
      `emailQueueProvider.add(EMAIL_JOB_NAMES.verification, { to, from: MAIL_SENDERS.noReply, subject: 'verify email', html })`.
- All existing guard clauses (user-not-found, already-active, valid-token-exists, expired-token delete) are unchanged
  and still run before any enqueue.

### DI container (`resendEmailVerification.container.ts`)

- Resolve and inject `resolveTemplateProvider()` and `resolveEmailQueueProvider()` as the last two constructor
  arguments, matching `signup.container.ts`.

## Tests (`resendEmailVerification.spec.ts`)

- Wired `MjmlProvider` and `MockEmailQueueProvider` into the setup and constructor call.
- Added `Should queue the verification email when resend succeeds` asserting `addMock` is called once with
  `EMAIL_JOB_NAMES.verification` and `objectContaining({ to: email })`.
- Extended the success-after-expiry test to also assert the email is queued.
- Added `not.toHaveBeenCalled()` assertions on `addMock` to the three guard/error paths (nonexistent user,
  already-active user, valid-token-already-exists).
- Preserved existing fake-timers usage and all prior assertions.

## Verification results

- Typecheck (`npm run typecheck`): PASS, zero errors.
- Targeted unit test (`resendEmailVerification.spec.ts`): 6/6 PASS.
- Full unit suite (`npm test`): 37 files, 145/145 tests PASS.
- Lint on the three changed files (`eslint`): PASS, no issues.
