## RBAC

Roles & permissions.

> This README describes the currently implemented access-control behavior. The approved target design for administrative
> user management is defined in [USER_ADMINISTRATION_POLICY.md](./USER_ADMINISTRATION_POLICY.md) and will be enforced
> incrementally in subsequent implementation stages.

### Roles

- Owner
- Admin
- Partner
- Member
- Anonymous (not logged-in users)

Owner is the single governance authority and retains the broad `manage all` CASL baseline. Admin permissions are
explicit: content operations are enumerated, and user mutations are conditional on the concrete target and requested
role. Generic user creation and role-update requests cannot assign Owner; ownership will be changed only by the
dedicated transfer flow introduced in a later stage.

User routes use subject-type checks only as an early fail-fast gate. Every user administration service reloads the actor
from persistence, and target mutations are authorized against concrete User subjects. The resource tables retain their
legacy columns; where Owner is omitted, Owner follows the Admin column unless the section states otherwise.

### Permissions Table

> ✅ = allowed  
> ❌ = not allowed  
> 🟠 = allowed within conditions

#### Users

User management is Owner/Admin-only. Partner and Member have no abilities over the `User` subject, so any `/users`
operation returns `403 Forbidden` for them. Generic create and role-update payloads reject the Owner role.

| Capability                                   | Owner | Admin | Partner | Member | Anonymous |
| -------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create member or partner                     |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Create admin                                 |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Get or list users                            |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Change member ↔ partner                      |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Promote member/partner to admin              |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Demote admin to member/partner               |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Delete member or partner                     |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Delete admin                                 |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate member or partner         |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate admin                     |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate owner                     |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Create, change, or delete owner generically  |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Change role or delete self through `/users`  |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Repeat an authorized current-role assignment | No-op | No-op |   ❌    |   ❌   |    ❌     |

Role-change and delete decisions use the actor and target records loaded from persistence in the same transaction as the
mutation. A valid access token carrying a stale role cannot override the actor's current persisted role.

#### Profile (self-service)

Profile operations act only on the authenticated user. They are gated by authentication (`verifyAndRenewToken`) and are
not enforced by CASL: there is no `Profile` subject. Authenticated roles may manage their own profile, except that Owner
cannot delete the owner account before transferring ownership.

|                            | Owner | Admin | Partner | Member | Anonymous |
| -------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Get own profile (`/me`)    |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own profile (`/me`) |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete own profile (`/me`) |  ❌   |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own password        |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |

#### Categories

|                 | Admin | Partner | Member | Anonymous |
| --------------- | :---: | :-----: | :----: | :-------: |
| Create category |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete category |  ✅   |   ✅    |   ❌   |    ❌     |
| Get category    |  ✅   |   ✅    |   ✅   |    ✅     |
| List categories |  ✅   |   ✅    |   ✅   |    ✅     |
| Update category |  ✅   |   ✅    |   ❌   |    ❌     |

#### Units

|             | Admin | Partner | Member | Anonymous |
| ----------- | :---: | :-----: | :----: | :-------: |
| Create unit |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete unit |  ✅   |   ✅    |   ❌   |    ❌     |
| Get unit    |  ✅   |   ✅    |   ✅   |    ✅     |
| List units  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update unit |  ✅   |   ✅    |   ❌   |    ❌     |

#### Ingredients

|                   | Admin | Partner | Member | Anonymous |
| ----------------- | :---: | :-----: | :----: | :-------: |
| Create ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Get ingredient    |  ✅   |   ✅    |   ✅   |    ✅     |
| List ingredients  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update ingredient |  ✅   |   ✅    |   ❌   |    ❌     |

#### Drinks

The three update endpoints (`PATCH /drinks`, `PATCH /drinks/:id/cover`, `PATCH /drinks/:id/thumbnail`) are each gated by
`verifyPermissions('update', 'Drink')`, so they share the same Admin/Partner-allowed, Member/Anonymous-denied policy.

|                                                        | Admin | Partner | Member | Anonymous |
| ------------------------------------------------------ | :---: | :-----: | :----: | :-------: |
| Create drink (`POST /drinks`)                          |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete drink (`DELETE /drinks`)                        |  ✅   |   ✅    |   ❌   |    ❌     |
| Get drink (`GET /drinks/:id`)                          |  ✅   |   ✅    |   ✅   |    ✅     |
| List drinks (`GET /drinks`)                            |  ✅   |   ✅    |   ✅   |    ✅     |
| Update drink (`PATCH /drinks`)                         |  ✅   |   ✅    |   ❌   |    ❌     |
| Update drink cover (`PATCH /drinks/:id/cover`)         |  ✅   |   ✅    |   ❌   |    ❌     |
| Update drink thumbnail (`PATCH /drinks/:id/thumbnail`) |  ✅   |   ✅    |   ❌   |    ❌     |

#### Comments

Public reads (`GET /comments`, `GET /comments/:id`, `GET /drinks/:drink_id/comments`) expose only `visible` comments;
`hidden` and `flagged` records are treated as missing. The authenticated current-user list (`GET /me/comments`) returns
all statuses that belong to the caller. There is no arbitrary-user listing route.

Ownership for update and delete is evaluated against the stored comment loaded by its ID (concrete-subject check in the
service), not against a subject name. Create and current-user list are role-only and use static `verifyPermissions`.
Moderation (`PATCH /comments/:id/status`) is Admin-only.

|                 | Admin | Partner | Member | Anonymous |
| --------------- | :---: | :-----: | :----: | :-------: |
| Create comment  |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete comment  |  ✅   |   🟠    |   🟠   |    ❌     |
| Get comment     |  ✅   |   ✅    |   ✅   |    ✅     |
| List comments   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update comment  |  🟠   |   🟠    |   🟠   |    ❌     |
| Moderate status |  ✅   |   ❌    |   ❌   |    ❌     |

##### Conditions

- Only the resource owner may update a comment.
- The resource owner or an Owner/Admin actor may delete a comment.
- Only Owner/Admin actors may moderate comment status.

#### Ratings

Rating mirrors the Comment CRUD policy. Public reads (`GET /ratings`, `GET /ratings/:id`,
`GET /drinks/:drink_id/ratings`) require no authentication. The authenticated current-user list (`GET /me/ratings`)
always scopes to the caller. Ownership for update and delete is evaluated against the stored rating loaded by its ID
(concrete-subject check in the service). There is no arbitrary-user listing route.

|               | Admin | Partner | Member | Anonymous |
| ------------- | :---: | :-----: | :----: | :-------: |
| Create rating |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete rating |  ✅   |   🟠    |   🟠   |    ❌     |
| Get rating    |  ✅   |   ✅    |   ✅   |    ✅     |
| List ratings  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update rating |  🟠   |   🟠    |   🟠   |    ❌     |

##### Conditions

- Only the resource owner may update a rating.
- The resource owner or an Owner/Admin actor may delete a rating.

#### Auth (public)

Authentication endpoints are unauthenticated: they are reachable by anyone (Anonymous).

|                            | Admin | Partner | Member | Anonymous |
| -------------------------- | :---: | :-----: | :----: | :-------: |
| Sign up                    |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign in                    |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign out                   |  ✅   |   ✅    |   ✅   |    ✅     |
| Request password reset     |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm password reset     |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm email verification |  ✅   |   ✅    |   ✅   |    ✅     |
| Resend email verification  |  ✅   |   ✅    |   ✅   |    ✅     |
| Refresh token              |  ✅   |   ✅    |   ✅   |    ✅     |

#### Health (public probes)

Health probes are unauthenticated and expose no internal details. They are used by orchestration/infrastructure to check
liveness and readiness.

|                                   | Admin | Partner | Member | Anonymous |
| --------------------------------- | :---: | :-----: | :----: | :-------: |
| Liveness probe (`/health/live`)   |  ✅   |   ✅    |   ✅   |    ✅     |
| Readiness probe (`/health/ready`) |  ✅   |   ✅    |   ✅   |    ✅     |

### Session freshness

Every user has an internal monotonic `sessionVersion`. It is included in access tokens, refresh tokens, and the
encrypted refresh session, but omitted from profile and user-administration responses.

A role change increments the target user's version in the same transaction. An authorized assignment of the current role
is a no-op and does not increment it.

Tokens claiming `owner` or `admin` are compared with the persisted version on every authenticated request. A stale
privileged token is rejected immediately. Tokens claiming `partner` or `member` do not add a database lookup to ordinary
requests; they may retain their old access-token permissions after a role change or suspension until expiration, but an
outdated refresh token cannot renew the session. A suspended account cannot sign in. Revocation returns `401` with
`apiResponses.auth.sessionRevoked` and clears both authentication cookies.

### Administrative audit

Successful administrative user creation, role change, suspension, reactivation, and deletion write an append-only
`administrative_events` record in the same MongoDB transaction as the mutation. If the audit write fails, the
administrative mutation is rolled back. Authorized no-op role/status assignments and read operations do not create
events.

Events contain only actor and target IDs, action, minimal before/after role or status state, origin, optional request
ID, optional reason, and occurrence time. They do not contain names, emails, credentials, tokens, session versions,
request bodies, IP addresses, or user agents.

Authorization denials are emitted as structured security logs and are not persisted in the audit collection. The
application exposes no audit read/update/delete repository operations or HTTP endpoints. MongoDB removes events after
730 days through the `administrative_event_occurred_at_ttl` index.

### Suspension lifecycle

Only an `active` account can transition to `suspended`, and only a `suspended` account can transition back to `active`.
An authorized request for the current state is an idempotent no-op: it does not write the user, increment
`sessionVersion`, or create an audit event. Pending and incomplete-profile accounts cannot use these transitions.

Suspension uses `POST /users/:id/suspension`; reactivation uses `POST /users/:id/reactivation`. Both require a trimmed
administrative reason between 10 and 500 characters. The reason is retained only in the audit event. Account content and
relationships remain unchanged, and this stage sends no email notification.
