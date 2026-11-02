# User Administration Authorization Policy

**Scope:** `drunk-flavor-back` user administration

## Purpose

This document defines the normative rules behind administrative user management. It is the reference for changes to
roles, CASL abilities, user administration use cases, persistence constraints, API contracts, and security tests.

The per-route capabilities of each role are listed in the [access-control README](./README.md). This document explains
the rules those tables must satisfy.

## Goals

- Preserve one accountable root authority without making routine operations depend on database access.
- Allow multiple operational administrators without allowing peer administrators to control each other.
- Apply least privilege and deny access unless a capability is explicitly granted.
- Keep authorization decisions enforceable in the backend and independent of the transport layer.
- Model object-level decisions from the actor, target user, requested action, and requested state.
- Make ownership changes explicit, atomic, auditable, and recoverable.

## Non-goals

This policy does not define:

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
- **Generic administration:** Read, list, role change, suspension, reactivation, session revocation, or closure of an
  existing account through normal user administration endpoints. Accounts are created only through self-service sign-up;
  generic administration never creates users.
- **Ownership transfer:** The only operation allowed to replace the current owner.
- **Self-service:** Operations on the authenticated user's own profile through dedicated `/me` use cases. Self-service
  is outside generic administration.

## Roles

### Owner

The single governance authority for the application. The owner can govern administrators and perform operational
administration. Ownership is not assigned through role-update operations.

### Admin

An operational administrator. An admin can manage members and partners and can read administrative user information as
permitted by data-projection rules. An admin cannot promote anyone to admin, and cannot demote, suspend, reactivate,
close, or revoke the sessions of another admin or the owner.

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

- `get`
- `list`
- `changeRole`
- `suspend`
- `reactivate`
- `close`
- `revokeSessions`
- `transferOwnership`

`manage` remains CASL's action alias for all actions, but it must not be granted broadly to `admin` on `User`. Specific
actions make security reviews, audit events, and future restrictions unambiguous.

Reading a user does not imply access to every stored field. Password hashes, token data, authentication secrets,
internal security metadata such as `sessionVersion`, and other restricted fields must never be exposed by the general
user-administration projection.

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
3. Generic administration cannot create accounts; every account starts through self-service sign-up as a member.
4. The owner cannot be changed, suspended, reactivated, closed, or have their sessions revoked by generic
   administration.
5. The owner cannot close the owner account through self-service; ownership must be transferred first.
6. Ownership can change only through the dedicated ownership-transfer use case.
7. An actor cannot change their own role through generic administration.
8. An actor cannot suspend, reactivate, close, or revoke the sessions of their own account through generic
   administration.
9. An admin cannot mutate an admin or owner account.
10. An admin cannot promote anyone to admin.
11. A partner, member, or anonymous requester cannot use generic user-administration operations.
12. Authorization must use the actor's current persisted role and status for security-sensitive operations. A stale
    token claim is insufficient.
13. Every user has a monotonic `sessionVersion`. Role changes, authorization-relevant status changes, credential
    changes, administrative session revocation, and account closure invalidate it atomically within the mutation.
14. Every authenticated request validates the presented `sessionVersion`, regardless of the claimed role. The persisted
    user is the source of truth; a short-lived Redis marker may only allow skipping the persisted lookup when it proves
    that no session-affecting change happened since the access token was issued.
15. A session-version invalidation must not commit without its marker; a marker that cannot be written aborts the
    mutation. A missing, stale, or unavailable marker store defers to the persisted user and never trusts the token.
16. Refresh-token renewal always validates against the persisted user.
17. Administrative session revocation ends every application session of the target without changing their role or
    status. It applies only to active or suspended targets.
18. Ownership transfer, privileged role changes, and other critical operations require recent authentication through
    password or Google step-up.
19. Administrative mutations produce immutable audit events in the same transaction; an audit failure rolls back the
    mutation.
20. UI visibility and client-side CASL checks are advisory only; the backend is authoritative.

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

Conditions such as target ID, current role, requested role, and status attributes can be evaluated only against a
concrete subject. Services must load the persisted target and pass a `UserPermissionModel` to CASL before a target
mutation. Checking only `'User'` is insufficient for `changeRole`, `suspend`, `reactivate`, `close`, and
`revokeSessions`.

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

Owner permissions may later be enumerated instead of using `manage all` if that produces clearer boundaries.

### Separate ability checks from transactional invariants

CASL answers whether an actor can perform an action on a subject. It must not be the sole mechanism for cross-record or
transactional guarantees such as exactly one owner, atomic ownership transfer, session invalidation, or audit
persistence.

Those guarantees belong to domain services and persistence constraints. The expected decision sequence is:

1. Authenticate the request.
2. Load the current actor from persistence.
3. Load the persisted target.
4. Build the actor's CASL ability.
5. Validate hard self-administration and owner-flow invariants.
6. Check the specific action against the concrete subject.
7. Validate the transition and resolve an authorized same-state request as a no-op.
8. Commit the mutation and required side effects atomically where applicable.

Middleware may perform an early coarse-grained subject-type check, but the use case must repeat the target-aware check
before mutation.

## Error contract

The API uses its stable `localeKey` as the machine-readable error identifier. A separate `code` field may be introduced
later without changing the policy semantics.

| Situation                                                   | HTTP status | Error identifier                                       |
| ----------------------------------------------------------- | :---------: | ------------------------------------------------------ |
| Missing or invalid authentication                           |     401     | Authentication-specific `apiResponses.auth.*` key      |
| Session version is stale or its user is no longer usable    |     401     | `apiResponses.auth.sessionRevoked`                     |
| Recent authentication is required                           |     401     | `apiResponses.profile.recentAuthenticationRequired`    |
| Actor lacks the requested capability                        |     403     | `apiResponses.users.administrationForbidden`           |
| Generic administration targets the actor                    |     403     | `apiResponses.users.selfAdministrationForbidden`       |
| Admin attempts to mutate an admin                           |     403     | `apiResponses.users.adminPeerManagementForbidden`      |
| Generic administration targets an owner                     |     403     | `apiResponses.users.ownerManagementRequiresTransfer`   |
| Target user does not exist                                  |     404     | `apiResponses.users.notFound`                          |
| Requested role transition is not valid from current state   |     409     | `apiResponses.users.invalidRoleTransition`             |
| Requested status transition is not valid from current state |     409     | `apiResponses.users.invalidStatusTransition`           |
| Authorized request produces no change                       |   Success   | No error; return without persistence or a change event |
| Another owner already exists during bootstrap or transfer   |     409     | `apiResponses.users.ownerAlreadyExists`                |
| Operation would leave the system without an owner           |     409     | Reserved owner-continuity error                        |
| Validated role or action is not recognized                  |     400     | Validation-specific `apiResponses.users.*` key         |

Authorization failures must not reveal restricted user data. Whether an unauthorized caller receives `403` or an opaque
`404` for a specific lookup may be tightened at the route boundary, but internal policy failures must retain a precise
audit reason.

## Enforcement boundaries

- **Routes and middleware:** Authentication credentials, coarse-grained fail-fast checks, request validation, and HTTP
  mapping.
- **CASL ability:** Actor capabilities and target-attribute conditions.
- **User administration policy:** Valid transitions and business invariants involving actor, target, and desired state.
- **Use cases:** Enforcement orchestration and side effects, including session invalidation.
- **Accounts public module:** Session validation for authenticated requests.
- **Repositories/database:** Atomic writes, unique-owner constraint, and concurrency safety.
- **Frontend:** Presentation only; never an authorization boundary.

## Review checklist

A change to user administration is acceptable only when reviewers can answer yes to each applicable question:

- Is the action explicitly represented in the typed CASL ability?
- Is the actor loaded from current persisted state for a sensitive operation?
- Is a concrete target subject checked when the decision depends on target attributes?
- Is the requested transition explicitly allowed by this policy?
- Are self-administration and owner invariants preserved?
- Can concurrent requests violate owner uniqueness or continuity?
- Does every session-affecting change invalidate the session version through the shared session-invalidation helper?
- Are client-side checks treated only as presentation logic?
- Does the error use the documented status and stable code?
- Are new grants narrow and deny-by-default behavior preserved?
- If `cannot` is used, does its position preserve the intended CASL precedence?
- Does the access-control README still reflect the per-route capabilities?

## References

- [CASL: Introduction and rule behavior](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/intro/en.md)
- [CASL: Defining rules](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/define-rules/en.md)
- [CASL: Subject type detection](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/guide/subject-type-detection/en.md)
- [CASL: Roles with static permissions](https://github.com/stalniy/casl/blob/main/docs-src/src/content/pages/cookbook/roles-with-static-permissions/en.md)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [NIST Role-Based Access Control FAQ](https://csrc.nist.gov/projects/role-based-access-control/faqs)

External guidance is summarized and adapted to this application's domain; it is not reproduced verbatim.
