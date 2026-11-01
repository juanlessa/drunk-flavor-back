## RBAC

Roles & permissions.

> This README lists the implemented per-route access-control behavior. The normative rules behind these tables are
> defined in [USER_ADMINISTRATION_POLICY.md](./USER_ADMINISTRATION_POLICY.md).

### Roles

- Owner
- Admin
- Partner
- Member
- Anonymous (not logged-in users)

Owner is the single governance authority and retains the broad `manage all` CASL baseline. Admin permissions are
explicit: content operations are enumerated, and user mutations are conditional on the concrete target and requested
role. Generic user creation and role-update requests cannot assign Owner; ownership changes only through the dedicated
ownership-transfer flow.

User routes use subject-type checks only as an early fail-fast gate. Every user administration service reloads the actor
from persistence, and target mutations are authorized against concrete User subjects.

### Permissions Table

> ✅ = allowed  
> ❌ = not allowed  
> 🟠 = allowed within conditions

#### Users

User management is Owner/Admin-only. Partner and Member have no abilities over the `User` subject, so any `/users`
operation returns `403 Forbidden` for them. Generic create and role-update payloads reject the Owner role.

| Capability                                                                                                                            | Owner | Admin | Partner | Member | Anonymous |
| ------------------------------------------------------------------------------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create member or partner (`POST /users`)                                                                                              |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Create admin (`POST /users`)                                                                                                          |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Get or list users (`GET /users/:id`, `GET /users`)                                                                                    |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Get administrative capabilities for a user (`GET /users/:id/administrative-capabilities`)                                             |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Change member ↔ partner (`PATCH /users/role`)                                                                                         |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Promote member/partner to admin (`PATCH /users/role`)                                                                                 |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Demote admin to member/partner (`PATCH /users/role`)                                                                                  |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Close member or partner (`POST /users/:id/closure`)                                                                                   |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Close admin (`POST /users/:id/closure`)                                                                                               |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate member or partner (`POST /users/:id/suspension`, `POST /users/:id/reactivation`)                                   |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate admin (`POST /users/:id/suspension`, `POST /users/:id/reactivation`)                                               |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Suspend/reactivate owner (`POST /users/:id/suspension`, `POST /users/:id/reactivation`)                                               |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Create, change, close, or suspend owner (`POST /users`, `PATCH /users/role`, `POST /users/:id/closure`, `POST /users/:id/suspension`) |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Change role or close self (`PATCH /users/role`, `POST /users/:id/closure`)                                                            |  ❌   |  ❌   |   ❌    |   ❌   |    ❌     |
| Repeat an authorized current-role assignment (`PATCH /users/role`)                                                                    | No-op | No-op |   ❌    |   ❌   |    ❌     |

Role-change and closure decisions use the actor and target records loaded from persistence in the same transaction as
the mutation. A valid access token carrying a stale role cannot override the actor's current persisted role.

#### Ownership transfer

Ownership transfer commands and the pending-invitation read are reserved for the current Owner through the
`transferOwnership` ability.

|                                                                      | Owner | Admin | Partner | Member | Anonymous |
| -------------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Get pending transfer (`GET /administration/ownership-transfer`)      |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Request transfer (`POST /administration/ownership-transfer`)         |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Resend invitation (`POST /administration/ownership-transfer/resend`) |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Cancel transfer (`DELETE /administration/ownership-transfer`)        |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Accept transfer (`POST /administration/ownership-transfer/accept`)   |  ❌   |  🟠   |   ❌    |   ❌   |    ❌     |

##### Conditions

- Only an active, email-verified admin with at least one authentication method can be invited.
- Only the invited admin may accept the invitation.

#### Profile (self-service)

Profile operations act only on the authenticated user. They are gated by authentication (`verifyAndRenewToken`) and are
not enforced by CASL: there is no `Profile` subject. Authenticated roles may manage their own profile, except that Owner
cannot close the owner account before transferring ownership. Account closure, password creation, and Google identity
linking require recent authentication.

|                                                                     | Owner | Admin | Partner | Member | Anonymous |
| ------------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Get own profile (`GET /me`)                                         |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own profile (`PATCH /me`)                                    |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own avatar (`PATCH /me/avatar`)                              |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Close own profile (`DELETE /me`)                                    |  ❌   |  ✅   |   ✅    |   ✅   |    ❌     |
| Create own password (`POST /me/password`)                           |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own password (`PATCH /me/password`)                          |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Link Google identity (`POST /me/identities/google`)                 |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Reauthenticate with password (`POST /me/reauthentication/password`) |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Reauthenticate with Google (`POST /me/reauthentication/google`)     |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |

#### Categories

|                                        | Owner | Admin | Partner | Member | Anonymous |
| -------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create category (`POST /categories`)   |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete category (`DELETE /categories`) |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Get category (`GET /categories/:id`)   |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List categories (`GET /categories`)    |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update category (`PATCH /categories`)  |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |

#### Units

|                               | Owner | Admin | Partner | Member | Anonymous |
| ----------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create unit (`POST /units`)   |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete unit (`DELETE /units`) |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Get unit (`GET /units/:id`)   |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List units (`GET /units`)     |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update unit (`PATCH /units`)  |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |

#### Ingredients

|                                           | Owner | Admin | Partner | Member | Anonymous |
| ----------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create ingredient (`POST /ingredients`)   |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete ingredient (`DELETE /ingredients`) |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Get ingredient (`GET /ingredients/:id`)   |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List ingredients (`GET /ingredients`)     |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update ingredient (`PATCH /ingredients`)  |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |

#### Drinks

The three update endpoints (`PATCH /drinks`, `PATCH /drinks/:id/cover`, `PATCH /drinks/:id/thumbnail`) are each gated by
`verifyPermissions('update', 'Drink')`, so they share the same Owner/Admin/Partner-allowed, Member/Anonymous-denied
policy.

|                                                        | Owner | Admin | Partner | Member | Anonymous |
| ------------------------------------------------------ | :---: | :---: | :-----: | :----: | :-------: |
| Create drink (`POST /drinks`)                          |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete drink (`DELETE /drinks`)                        |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Get drink (`GET /drinks/:id`)                          |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List drinks (`GET /drinks`)                            |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update drink (`PATCH /drinks`)                         |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Update drink cover (`PATCH /drinks/:id/cover`)         |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Update drink thumbnail (`PATCH /drinks/:id/thumbnail`) |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |

#### Comments

Public reads (`GET /comments`, `GET /comments/:id`, `GET /drinks/:drinkId/comments`) expose only `visible` comments;
`hidden` and `flagged` records are treated as missing. The authenticated current-user list (`GET /me/comments`) returns
all statuses that belong to the caller. There is no arbitrary-user listing route.

Ownership for update and delete is evaluated against the stored comment loaded by its ID (concrete-subject check in the
service), not against a subject name. Create and current-user list are role-only and use static `verifyPermissions`.
Moderation (`PATCH /comments/:id/status`) is Owner/Admin-only.

|                                                                  | Owner | Admin | Partner | Member | Anonymous |
| ---------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create comment (`POST /comments`)                                |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete comment (`DELETE /comments/:id`)                          |  ✅   |  ✅   |   🟠    |   🟠   |    ❌     |
| Get comment (`GET /comments/:id`)                                |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List comments (`GET /comments`, `GET /drinks/:drinkId/comments`) |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update comment (`PATCH /comments/:id`)                           |  🟠   |  🟠   |   🟠    |   🟠   |    ❌     |
| Moderate status (`PATCH /comments/:id/status`)                   |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |

##### Conditions

- Only the resource owner may update a comment.
- The resource owner or an Owner/Admin actor may delete a comment.
- Only Owner/Admin actors may moderate comment status.

#### Ratings

Rating mirrors the Comment CRUD policy. Public reads (`GET /ratings`, `GET /ratings/:id`,
`GET /drinks/:drinkId/ratings`) require no authentication. The authenticated current-user list (`GET /me/ratings`)
always scopes to the caller. Ownership for update and delete is evaluated against the stored rating loaded by its ID
(concrete-subject check in the service). There is no arbitrary-user listing route.

|                                                               | Owner | Admin | Partner | Member | Anonymous |
| ------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create rating (`POST /ratings`)                               |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete rating (`DELETE /ratings/:id`)                         |  ✅   |  ✅   |   🟠    |   🟠   |    ❌     |
| Get rating (`GET /ratings/:id`)                               |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| List ratings (`GET /ratings`, `GET /drinks/:drinkId/ratings`) |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update rating (`PATCH /ratings/:id`)                          |  🟠   |  🟠   |   🟠    |   🟠   |    ❌     |

##### Conditions

- Only the resource owner may update a rating.
- The resource owner or an Owner/Admin actor may delete a rating.

#### Auth (public)

Authentication endpoints are unauthenticated: they are reachable by anyone (Anonymous).

|                                                                 | Owner | Admin | Partner | Member | Anonymous |
| --------------------------------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Sign up (`POST /signup`)                                        |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign in (`POST /signin`)                                        |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign out (`POST /signout`)                                      |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Request password reset (`POST /password-reset/request`)         |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm password reset (`POST /password-reset/confirm`)         |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm email verification (`POST /email-verification/confirm`) |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Resend email verification (`POST /email-verification/resend`)   |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Refresh token (`POST /refresh-token`)                           |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |

#### Health (public probes)

Health probes are unauthenticated and expose no internal details. They are used by orchestration/infrastructure to check
liveness and readiness.

|                                       | Owner | Admin | Partner | Member | Anonymous |
| ------------------------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Liveness probe (`GET /health/live`)   |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
| Readiness probe (`GET /health/ready`) |  ✅   |  ✅   |   ✅    |   ✅   |    ✅     |
