## RBAC

Roles & permissions.

### Roles

-   Admin
-   Partner
-   Member
-   Anonymous (not logged-in users)

### Permissions Table

#### Users

User management is admin-only. Partner and Member have no abilities over the `User` subject,
so any `/users` operation returns `403 Forbidden` for them.

|                  | Admin | Partner | Member | Anonymous |
| ---------------- | :---: | :-----: | :----: | :-------: |
| Create user      |  ✅   |   ❌    |   ❌   |    ❌     |
| Get user         |  ✅   |   ❌    |   ❌   |    ❌     |
| List users       |  ✅   |   ❌    |   ❌   |    ❌     |
| Update user role |  ✅   |   ❌    |   ❌   |    ❌     |
| Delete user      |  ✅   |   ❌    |   ❌   |    ❌     |

#### Profile (self-service)

Profile operations act only on the authenticated user. They are gated by authentication
(`verifyAndRenewToken`) and are not enforced by CASL: there is no `Profile` subject. Any
authenticated role may manage its own profile; Anonymous cannot.

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

#### Ingredients

|                   | Admin | Partner | Member | Anonymous |
| ----------------- | :---: | :-----: | :----: | :-------: |
| Create ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Get ingredient    |  ✅   |   ✅    |   ✅   |    ✅     |
| List ingredients  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update ingredient |  ✅   |   ✅    |   ❌   |    ❌     |

#### Drinks

|              | Admin | Partner | Member | Anonymous |
| ------------ | :---: | :-----: | :----: | :-------: |
| Create drink |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete drink |  ✅   |   ✅    |   ❌   |    ❌     |
| Get drink    |  ✅   |   ✅    |   ✅   |    ✅     |
| List drinks  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update drink |  ✅   |   ✅    |   ❌   |    ❌     |

#### Comments

|                | Admin | Partner | Member | Anonymous |
| -------------- | :---: | :-----: | :----: | :-------: |
| Create comment |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete comment |  ✅   |   🟠    |   🟠   |    ❌     |
| Get comment    |  ✅   |   ✅    |   ✅   |    ✅     |
| List comments  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update comment |  🟠   |   🟠    |   🟠   |    ❌     |

#### Auth (public)

Authentication endpoints are unauthenticated: they are reachable by anyone (Anonymous).

|                           | Admin | Partner | Member | Anonymous |
| ------------------------- | :---: | :-----: | :----: | :-------: |
| Sign up                   |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign in                   |  ✅   |   ✅    |   ✅   |    ✅     |
| Sign out                  |  ✅   |   ✅    |   ✅   |    ✅     |
| Request password reset    |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm password reset    |  ✅   |   ✅    |   ✅   |    ✅     |
| Confirm email verification |  ✅  |   ✅    |   ✅   |    ✅     |
| Resend email verification |  ✅   |   ✅    |   ✅   |    ✅     |
| Refresh token             |  ✅   |   ✅    |   ✅   |    ✅     |

#### Health (public probes)

Health probes are unauthenticated and expose no internal details. They are used by
orchestration/infrastructure to check liveness and readiness.

|                              | Admin | Partner | Member | Anonymous |
| ---------------------------- | :---: | :-----: | :----: | :-------: |
| Liveness probe (`/health/live`)  |  ✅   |   ✅    |   ✅   |    ✅     |
| Readiness probe (`/health/ready`) |  ✅   |   ✅    |   ✅   |    ✅     |

> ✅ = allowed  
> ❌ = not allowed  
> 🟠 = allowed within conditions

#### Conditions

-   Only owner may update comment
-   Only owner or admins may delete comment
