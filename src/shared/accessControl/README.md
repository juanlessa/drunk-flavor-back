## RBAC

Roles & permissions.

### Roles

- Admin
- Partner
- Member
- Anonymous (not logged-in users)

### Permissions Table

> ✅ = allowed  
> ❌ = not allowed  
> 🟠 = allowed within conditions

#### Users

User management is admin-only. Partner and Member have no abilities over the `User` subject, so any `/users` operation
returns `403 Forbidden` for them.

|                  | Admin | Partner | Member | Anonymous |
| ---------------- | :---: | :-----: | :----: | :-------: |
| Create user      |  ✅   |   ❌    |   ❌   |    ❌     |
| Get user         |  ✅   |   ❌    |   ❌   |    ❌     |
| List users       |  ✅   |   ❌    |   ❌   |    ❌     |
| Update user role |  ✅   |   ❌    |   ❌   |    ❌     |
| Delete user      |  ✅   |   ❌    |   ❌   |    ❌     |

#### Profile (self-service)

Profile operations act only on the authenticated user. They are gated by authentication (`verifyAndRenewToken`) and are
not enforced by CASL: there is no `Profile` subject. Any authenticated role may manage its own profile; Anonymous
cannot.

|                            | Admin | Partner | Member | Anonymous |
| -------------------------- | :---: | :-----: | :----: | :-------: |
| Get own profile (`/me`)    |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own profile (`/me`) |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete own profile (`/me`) |  ✅   |   ✅    |   ✅   |    ❌     |
| Update own password        |  ✅   |   ✅    |   ✅   |    ❌     |

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

- Only owner may update comment
- Only owner or admins may delete comment
- Only admins may moderate comment status

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

- Only owner may update rating
- Only owner or admins may delete rating

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
