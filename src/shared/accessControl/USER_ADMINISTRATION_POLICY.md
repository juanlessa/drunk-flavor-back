# User Administration Authorization Policy

**Status:** Policy, CASL model, and user-administration use-case enforcement implemented

**Scope:** `drunk-flavor-back` user administration

**Version:** 1.3

## Purpose

This document defines the authorization model for administrative user management. It is the normative reference for
future changes to roles, CASL abilities, user administration use cases, persistence constraints, API contracts, and
security tests.

The current implementation may be less restrictive than this policy until the corresponding implementation stages are
completed. The existing access-control README continues to describe currently implemented behavior.

## Goals

- Preserve one accountable root authority without making routine operations depend on database access.
- Allow multiple operational administrators without allowing peer administrators to control each other.
- Apply least privilege and deny access unless a capability is explicitly granted.
- Keep authorization decisions enforceable in the backend and independent of the transport layer.
- Model object-level decisions from the actor, target user, requested action, and requested state.
- Make ownership changes explicit, atomic, auditable, and recoverable.

## Non-goals

This version does not define:

- A `user_manager` role.
- Multiple owners.
- Automatic owner succession.
- Runtime-configurable roles or per-user permission grants.
- Two-person approval.
- Frontend behavior.
- The complete emergency-access procedure.

These capabilities require a demonstrated operational need before they are introduced.

## Terminology

- **Actor:** The authenticated user requesting an operation.
- **Target:** The user affected by an operation.
- **Requested role:** The role that would be assigned if a role transition succeeds.
- **Generic administration:** Create, read, list, role change, suspension, reactivation, or deletion through normal user
  administration endpoints.
- **Ownership transfer:** The only operation allowed to replace the current owner.
- **Self-service:** Operations on the authenticated user's own profile through dedicated `/me` use cases. Self-service
  is outside generic administration.

## Roles

### Owner

The single governance authority for the application. The owner can govern administrators and perform operational
administration. Ownership is not assigned through generic user creation or role-update operations.

### Admin

An operational administrator. An admin can manage members and partners and can read administrative user information as
permitted by data-projection rules. An admin cannot create, promote, demote, suspend, reactivate, or delete another
admin or the owner.

### Partner

A trusted content operator. Partner permissions over catalog resources remain separate from user administration. A
partner has no generic user-administration capabilities.

### Member

A regular application user. A member has no generic user-administration capabilities.

### Anonymous

An unauthenticated requester. Anonymous requesters have no user-administration capabilities.

## Authority model

```text
owner
  └── admin
        ├── partner
        └── member
```

This diagram represents governance authority, not automatic permission inheritance. Each role must have an explicit CASL
permission definition. Application code must not infer authorization from role ordering or string comparison.

## Administrative actions

User administration uses specific actions instead of treating every mutation as `update`:

- `create`
- `get`
- `list`
- `changeRole`
- `suspend`
- `reactivate`
- `delete`
- `transferOwnership`

`manage` remains CASL's action alias for all actions, but it must not be granted broadly to `admin` on `User`. Specific
actions make security reviews, audit events, and future restrictions unambiguous.

## Capability matrix

A checkmark means the role may perform the action subject to the invariants and target rules below. A dash means denied
by default.

| Capability                               | Owner | Admin | Partner | Member | Anonymous |
| ---------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| List users                               |  Yes  |  Yes  |    —    |   —    |     —     |
| Get a user                               |  Yes  |  Yes  |    —    |   —    |     —     |
| Create member                            |  Yes  |  Yes  |    —    |   —    |     —     |
| Create partner                           |  Yes  |  Yes  |    —    |   —    |     —     |
| Create admin                             |  Yes  |   —   |    —    |   —    |     —     |
| Create owner                             |   —   |   —   |    —    |   —    |     —     |
| Change member to partner                 |  Yes  |  Yes  |    —    |   —    |     —     |
| Change partner to member                 |  Yes  |  Yes  |    —    |   —    |     —     |
| Promote member or partner to admin       |  Yes  |   —   |    —    |   —    |     —     |
| Demote admin to partner or member        |  Yes  |   —   |    —    |   —    |     —     |
| Change owner through generic role update |   —   |   —   |    —    |   —    |     —     |
| Suspend member or partner                |  Yes  |  Yes  |    —    |   —    |     —     |
| Reactivate member or partner             |  Yes  |  Yes  |    —    |   —    |     —     |
| Suspend or reactivate admin              |  Yes  |   —   |    —    |   —    |     —     |
| Suspend or reactivate owner              |   —   |   —   |    —    |   —    |     —     |
| Delete member or partner                 |  Yes  |  Yes  |    —    |   —    |     —     |
| Delete admin                             |  Yes  |   —   |    —    |   —    |     —     |
| Delete owner                             |   —   |   —   |    —    |   —    |     —     |
| Transfer ownership                       |  Yes  |   —   |    —    |   —    |     —     |

Reading a user does not imply access to every stored field. Password hashes, token data, authentication secrets,
internal security metadata, and other restricted fields must never be exposed by the general user-administration
projection.

## Valid role transitions

Generic role changes may perform only these transitions:

```text
member  -> partner    actor: owner or admin
partner -> member     actor: owner or admin
member  -> admin      actor: owner
partner -> admin      actor: owner
admin   -> partner    actor: owner
admin   -> member     actor: owner
```

The following are not generic role transitions:

```text
*     -> owner        ownership transfer only
owner -> *            ownership transfer only
role  -> same role    authorized idempotent no-op; do not persist or emit a change event
```

A role-transition request must be evaluated from the persisted current target role, not from client-supplied
current-state data.

## Invariants

These rules apply even when a broad CASL rule would otherwise allow an action.

1. Exactly one active owner must exist after every committed administrative operation.
2. At most one owner must be enforced by a database constraint, not only by an application-level count.
3. The owner cannot be created by a generic user-creation endpoint.
4. The owner cannot be changed, suspended, reactivated, or deleted by generic administration.
5. The owner cannot delete the owner account through self-service; ownership must be transferred first.
6. Ownership can change only through the dedicated ownership-transfer use case.
7. An actor cannot change their own role through generic administration.
8. An actor cannot suspend, reactivate, or delete their own account through generic administration.
9. An admin cannot mutate an admin or owner account.
10. An admin cannot create or promote an admin.
11. A partner, member, or anonymous requester cannot use generic user-administration operations.
12. Authorization must use the actor's current persisted role and status for security-sensitive operations. A stale
    token claim is insufficient.
13. Every user has a monotonic `sessionVersion`. Role and authorization-relevant status changes increment it atomically.
14. Tokens claiming `owner` or `admin` must match the persisted `sessionVersion` on every authenticated request.
15. Tokens claiming `partner` or `member` may remain usable on non-sensitive routes until access-token expiration, but
    an outdated refresh token must never renew the session.
16. Ownership transfer and privileged role changes must eventually require recent authentication as defined by the
    reauthentication implementation stage.
17. Administrative mutations must eventually produce immutable audit events as defined by the audit implementation
    stage.
18. UI visibility and client-side CASL checks are advisory only; the backend is authoritative.

## CASL modeling rules

### Static role permission definitions

Roles have predefined permissions in source code. Keep one typed permission-definition function per role and select it
centrally when building the ability. Do not scatter checks such as `if (role === 'admin')` across controllers and
services.

This follows CASL's static-role pattern and keeps role-to-permission mapping reviewable.

### Deny by default

An undeclared action and subject combination is denied. New roles, actions, and subjects must receive explicit grants;
they must not acquire capabilities through fallback behavior.

### Use concrete subjects for conditional checks

CASL distinguishes between a subject type and a subject instance:

- `ability.can('changeRole', 'User')` asks whether the actor can change the role of some user.
- `ability.can('changeRole', targetUserSubject)` asks whether the actor can change this user.

Conditions such as target ID, current role, requested role, and future status attributes can be evaluated only against a
concrete subject. Services must load the persisted target and pass a `UserPermissionModel` to CASL before a target
mutation. Checking only `'User'` is insufficient for `changeRole`, `suspend`, `reactivate`, and `delete`.

For creation, construct a prospective user permission subject from validated server-side input so CASL can evaluate the
requested role. Do not authorize conditional creation using only the `'User'` subject type.

### Keep subject detection explicit

User permission subjects must include their explicit discriminator:

```ts
{
  __typename: 'User',
  id: target.id,
  role: target.role,
  requestedRole
}
```

`detectSubjectType` must continue mapping concrete permission subjects through `__typename`. The permission schema must
contain every persisted attribute used by CASL conditions.

### Prefer positive, narrow grants

For `admin`, prefer grants constrained to member and partner targets over a broad `can('manage', 'User')` followed by
several exceptions. Narrow grants make the allowed set explicit and reduce rule-order mistakes.

If `cannot` rules are needed, define them after the corresponding `can` rules. CASL gives later matching rules
precedence, so reversing this order can unintentionally re-enable an operation.

### Reserve broad `manage` carefully

`manage` is a CASL alias for any action. `can('manage', 'all')` is acceptable only for the owner as a coarse-grained
baseline and does not override the domain invariants in this document. Admin user-management permissions must be
enumerated and target-aware.

A future implementation may also enumerate owner permissions instead of using `manage all` if that produces clearer
boundaries.

### Separate ability checks from transactional invariants

CASL answers whether an actor can perform an action on a subject. It must not be the sole mechanism for cross-record or
transactional guarantees such as exactly one owner, atomic ownership transfer, session invalidation, or audit
persistence.

Those guarantees belong to domain services and persistence constraints. The expected decision sequence is:

1. Authenticate the request.
2. Load the current actor from persistence.
3. Load the persisted target, or build a validated prospective subject for creation.
4. Build the actor's CASL ability.
5. Validate hard self-administration and owner-flow invariants.
6. Check the specific action against the concrete subject.
7. Validate the transition and resolve an authorized same-role request as a no-op.
8. Commit the mutation and required side effects atomically where applicable.

Middleware may perform an early coarse-grained subject-type check, but the use case must repeat the target-aware check
before mutation.

## Error contract

The current API uses its stable `localeKey` as the machine-readable error identifier. A separate `code` field may be
introduced later without changing the policy semantics.

| Situation                                                 | HTTP status | Current error identifier                               |
| --------------------------------------------------------- | :---------: | ------------------------------------------------------ |
| Missing or invalid authentication                         |     401     | Authentication-specific `apiResponses.auth.*` key      |
| Session version is stale or its user is no longer usable  |     401     | `apiResponses.auth.sessionRevoked`                     |
| Recent authentication is required                         |     401     | `apiResponses.profile.recentAuthenticationRequired`    |
| Actor lacks the requested capability                      |     403     | `apiResponses.users.administrationForbidden`           |
| Generic administration targets the actor                  |     403     | `apiResponses.users.selfAdministrationForbidden`       |
| Admin attempts to mutate an admin                         |     403     | `apiResponses.users.adminPeerManagementForbidden`      |
| Generic administration targets an owner                   |     403     | `apiResponses.users.ownerManagementRequiresTransfer`   |
| Target user does not exist                                |     404     | `apiResponses.users.notExist`                          |
| Requested role transition is not valid from current state |     409     | `apiResponses.users.invalidRoleTransition`             |
| Authorized request produces no role change                |   Success   | No error; return without persistence or a change event |
| Another owner already exists during bootstrap or transfer |     409     | `apiResponses.users.ownerAlreadyExists`                |
| Operation would leave the system without an owner         |     409     | Reserved owner-continuity error                        |
| Validated role or action is not recognized                |     400     | Validation-specific `apiResponses.users.*` key         |

Authorization failures must not reveal restricted user data. Whether an unauthorized caller receives `403` or an opaque
`404` for a specific lookup may be tightened at the route boundary, but internal policy failures must retain a precise
audit reason.

## Enforcement boundaries

- **Routes and middleware:** Authentication, coarse-grained fail-fast checks, request validation, and HTTP mapping.
- **CASL ability:** Actor capabilities and target-attribute conditions.
- **User administration policy:** Valid transitions and business invariants involving actor, target, and desired state.
- **Use cases:** Enforcement orchestration and side effects.
- **Repositories/database:** Atomic writes, unique-owner constraint, and concurrency safety.
- **Frontend:** Presentation only; never an authorization boundary.

## Implementation status

Implemented:

1. `owner` is part of the role model and the bootstrap creates at most one owner.
2. `UserPermissionModel` carries the current target role and optional `requestedRole` used by conditional role-change
   checks.
3. Administrative actions are part of the typed `UserSubject` union.
4. Admin user grants are explicit and conditional; admin no longer receives `manage all`.
5. `UserAdministrationPolicy` centralizes concrete-subject checks, transition rules, self-administration guards, owner
   guards, and the idempotent role-change outcome.
6. Every user administration use case reloads the actor from persistence and delegates authorization to the policy;
   target mutations use concrete subjects.
7. Role changes use `changeRole` exclusively and resolve an authorized same-role request without persistence.
8. Create, role-change, and delete authorization is rechecked in the same transaction as the mutation.
9. Profile self-deletion rejects the owner inside the account-deletion transaction; ownership must be transferred first.
10. `sessionVersion` is persisted internally, included in access and refresh tokens, and omitted from user-facing views.
11. Role changes increment `sessionVersion` atomically; authorized no-op assignments do not increment it.
12. Tokens claiming `owner` or `admin` are checked against persistence on every request. Other roles are checked when
    refreshing, preserving the approved bounded-staleness behavior.
13. A revoked session returns the opaque `apiResponses.auth.sessionRevoked` response and clears both authentication
    cookies.
14. Successful administrative mutations write a minimal append-only event in the same transaction; audit failure rolls
    back the mutation.
15. Administrative no-ops and reads do not create audit events. Authorization denials produce structured security logs
    instead of database events.
16. Administrative events expire through a 730-day MongoDB TTL index and have no application update/delete repository
    operations.

Pending:

1. Add suspension, reauthentication, and ownership transfer in their dedicated stages.
2. Reuse `sessionVersion` for password changes, account recovery, suspension, and explicit administrative revocation as
   those flows are implemented.
3. Extend the audit action set for suspension, reactivation, ownership transfer, and emergency recovery when those flows
   are implemented.

## Review checklist

A change to user administration is acceptable only when reviewers can answer yes to each applicable question:

- Is the action explicitly represented in the typed CASL ability?
- Is the actor loaded from current persisted state for a sensitive operation?
- Is a concrete target subject checked when the decision depends on target attributes?
- Is the requested transition explicitly allowed by this policy?
- Are self-administration and owner invariants preserved?
- Can concurrent requests violate owner uniqueness or continuity?
- Are client-side checks treated only as presentation logic?
- Does the error use the documented status and stable code?
- Are new grants narrow and deny-by-default behavior preserved?
- If `cannot` is used, does its position preserve the intended CASL precedence?

## References

- [CASL: Introduction and rule behavior](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/intro/en.md)
- [CASL: Defining rules](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/define-rules/en.md)
- [CASL: Subject type detection](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/subject-type-detection/en.md)
- [CASL: Roles with static permissions](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/cookbook/roles-with-static-permissions/en.md)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [NIST Role-Based Access Control FAQ](https://csrc.nist.gov/projects/role-based-access-control/faqs)

External guidance is summarized and adapted to this application's domain; it is not reproduced verbatim.
