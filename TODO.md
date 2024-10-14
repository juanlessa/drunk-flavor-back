# missing

### smtp

-   configure local email transporter, decide env variables
-   verify a health check option to don't start the application without smtp configured
-   verify if any domain provider offers smtp server
-   decide mail trap service

### users

-   user should handle the account status, like active and pending
-   registration route, this route will register an user, anyone can register, however the role will be the low lever.
    it should have email validation
-   resetPassword route, this route will be displayed in login page, it allows users to send a password reset to the
    email
-   update password, this password route allow user to change the password by sending the old, new and new confirm
    password
-   CRUD user allowed only for admin
-   improve the password mechanism by using salts
-   email confirmation route, should receive a valid signed and not expired token, if so should change the account
    status to active
-   think about how to cleanup not verified users after timeout
-   improve the login by verify if found user is active and notify "verify this account in your email if the user is not
    active"
-   think about user role verification direct in database or by token
-   think about user logout, user deletion and also user permission changes reflection
-

-   review authentication and create tests if its possible

-   improve fastify swagger ui integration

-   review and improve the e2e tests

-

### README.md

-   add a section about secret generation
-   fix the e2e env variable and explain about the memory mongo usage, remember the e2e setup command
-   add section about the other scripts like lints and so on
