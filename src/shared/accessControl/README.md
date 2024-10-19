## RBAC

Roles & permissions.

### Roles

-   Admin
-   Partner
-   Member
-   Anonymous (not logged-in users)

### Permissions Table

|                   | Admin | Partner | Member | Anonymous |
| ----------------- | :---: | :-----: | :----: | :-------: |
| Create category   |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete category   |  ✅   |   ✅    |   ❌   |    ❌     |
| Get category      |  ✅   |   ✅    |   ✅   |    ✅     |
| List categories   |  ✅   |   ✅    |   ✅   |    ✅     |
| Update category   |  ✅   |   ✅    |   ❌   |    ❌     |
| Create ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Get ingredient    |  ✅   |   ✅    |   ✅   |    ✅     |
| List ingredients  |  ✅   |   ✅    |   ✅   |    ✅     |
| Update ingredient |  ✅   |   ✅    |   ❌   |    ❌     |
| Create drink      |  ✅   |   ✅    |   ❌   |    ❌     |
| Delete drink      |  ✅   |   ✅    |   ❌   |    ❌     |
| Get drink         |  ✅   |   ✅    |   ✅   |    ✅     |
| List drinks       |  ✅   |   ✅    |   ✅   |    ✅     |
| Update drink      |  ✅   |   ✅    |   ❌   |    ❌     |
| Create comment    |  ✅   |   ✅    |   ✅   |    ❌     |
| Delete comment    |  ✅   |   🟠    |   🟠   |    ❌     |
| Get comment       |  ✅   |   ✅    |   ✅   |    ✅     |
| List comments     |  ✅   |   ✅    |   ✅   |    ✅     |
| Update comment    |  🟠   |   🟠    |   🟠   |    ❌     |

> ✅ = allowed  
> ❌ = not allowed  
> 🟠 = allowed within conditions

#### Conditions

-   Only owner may update comment
-   Only owner or admins may delete comment
