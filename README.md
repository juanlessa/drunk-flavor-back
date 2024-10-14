# DrunkFlavor

Welcome to DrunkFlavor, your ultimate destination for delicious alcoholic drink recipes! Whether you're a cocktail
enthusiast or looking to impress your friends at your next gathering, DrunkFlavor is here to provide you with a wide
array of enticing drink recipes to try in the comfort of your own home. From classic cocktails to our own adaptations,
our carefully curated collection will satisfy all taste preferences. Explore our recipe database, complete with
instructions and ingredient lists, making it easy for you to recreate these delectable drinks. Get ready to elevate your
mixology skills and discover the perfect libation for any occasion. Join our community and let DrunkFlavor be your go-to
resource for all things drinks!

# Development

DrunkFlavor is a open source project, if you are interested in knowing more about its development, you will find below
the link to the git repositories, as well as instructions to run it locally.  
Feel free to suggest improvements and report possible bugs, if you are a software developer pull requests are always
welcome.

Github repositories:

-   Backend: <https://github.com/juanlessa/drunk-flavor-back>
-   Frontend: <https://github.com/juanlessa/drunk-flavor-front>

## Backend

-   [Setup](#setup)
    -   [mongodb](#mongodb)
    -   [node.js](#nodejs)
    -   [dotenv](#dotenv)
    -   [secret-key](#secret-key)
-   [Dev](#dev)
-   [Testing](#dev)
-   [Build](#build)
-   [Documentation](#documentation)

## Setup

### mongodb

To run the DrunkFlavor backend locally, you must have an instance of MongoDB.  
To install MongoDB on macOS, execute the command below.

```shell
brew install mongodb-community
```

If you are using a different operating system, please refer to the installation guide on the
[MongoDB website](https://www.mongodb.com) for instructions.

### node.js

To run our API locally, you will need to have Node.js 20 or higher installed on your machine. To install Node.js on
macOS, execute the command below.

```shell
brew install node
```

If you are using a different operating system, please refer to the installation guide on the
[Node.js website](https://nodejs.org) for instructions.

You can run the commands below to check the versions of the node.js and npm.

```shell
$ node --version
v20.15.1

$ npm --version
10.8.3
```

Make sure that your node.js and npm versions are equal to or higher than these ones.

Finally run the command bellow to install the project dependencies.

```shell
npm install
```

Now your node.js setup is ready.

### dotenv

To execute the Node.js API, you need to add a file named `.env` at the root project folder, containing the environment
variables. You can use the [`.env.example`](https://github.com/juanlessa/drunk-flavor-back/blob/master/.env.example)
file and add the corresponding values for your environment, or simply copy the sample below:

```dotenv
# MongoDB
MONGO_USERNAME='drunkflavor'
MONGO_PASSWORD='drunkflavor'
MONGO_DATABASE='drunk-flavor'
MONGO_HOST='localhost'
MONGO_PORT='27017'
MONGO_PARAMS=''

# Environment
NODE_ENV='development'

# API
API_HOST="0.0.0.0"
API_PORT=3333

# Logger
LOG_LEVEL='debug'

# Storage
STORAGE_TYPE="local"

# Auth secrets
COOKIE_SECRET="bad-cookie-secret"
ACCESS_TOKEN_SECRET='bad-access-token-secret'
ACCESS_TOKEN_EXPIRES_IN_SECONDS=1440 # 4h
REFRESH_TOKEN_SECRET='bad-refresh-token-secret'
REFRESH_TOKEN_EXPIRES_IN_SECONDS=864000 # 10 days
USER_TOKEN_EXPIRES_IN_SECONDS=86400 # 1 day
USER_TOKEN_SIZE=16
PASSWORD_HASH_ROUNDS=8

# SMTP
# use some tool like ethereal (https://ethereal.email/) to easy get a mail trap credentials
SMTP_DOMAIN=''
SMTP_HOST=''
SMTP_PORT=587
SMTP_USERNAME=''
SMTP_PASSWORD=''
```

**Notes:**

-   This sample is considering that you did the MongoDB default installation. If this is not the case for you, please
    modify the `# MongoBD` variables to match with your database information's.
-   We do recommend you change the `COOKIE_SECRET`, `ACCESS_TOKEN_SECRET` and the `REFRESH_TOKEN_SECRET` values, you can
    just generate random strings and place there.

Now your environment setup is ready.

### secret-key

Our application uses the @fastify/secure-session library, which requires a secret key to encrypt and sign session
cookies. To generate this key, you can use the script included in the project:

```shell
npm run generate-secret-key
```

Make sure to securely store the generated key as it will be needed to run the application. For more details on how
@fastify/secure-session works, you can refer to the official documentation.

Now your secret key setup is ready.

## Dev

Once your setup is ready, you are able to run the drunkflavor API in development mode by using the command below.

```shell
npm run dev
```

You can also run in watch mode to automatically rerun on file changes:

```shell
npm run dev:watch
```

**Note:** make sure that when running the commands above, your MongoDB instance is available.

On macOS, you can execute the command below to start the MongoDB service.

```shell
brew services start mongodb-community
```

If you are using a different operating system, please refer to the documentation on the
[MongoDB website](https://www.mongodb.com).

## Testing

In this project, we use Vitest as our testing library.

### Unit Tests

You can run the unit tests (.spec.ts files) using the following command:

```shell
npm run test
```

You can also run the unit tests in watch mode:

```shell
npm run test:watch
```

### Template Tests

To run only the tests for email templates, use the following commands:

-   Run template tests:

```shell
npm run test:template
```

-   Run template tests in watch mode:

```shell
npm run test:template:watch
```

-   Run template tests and persist the output in the templates folder:

```shell
npm run test:template:output
```

-   Run template tests with persisted output in watch mode:

```shell
npm run test:template:output:watch
```

### End-to-End (E2E) Tests

Before running the E2E tests, you need to set up the Vitest MongoDB environment by executing:

```shell
npm run test:e2e:setup
```

This step only needs to be done once, unless you delete the node_modules folder.

After setup, you can run the E2E tests using:

```shell
npm run test:e2e
```

You can also run the E2E tests in watch mode:

```shell
npm run test:e2e:watch
```

**Notes:**

-   By default, the E2E tests use an in-memory MongoDB database. However, you can change this to use a traditional
    MongoDB instance by setting the MONGO_PERSISTENCE_MODE environment variable. In this case make sure to also
    configure the MongoDB connection variables.
-   You can override any default testing environment variables by adding a `.env.testing` file in the project root,
    following the structure of `.env.example`.

## Build

You can build the project by using the command below:

```shell
npm run build
```

The build result will be added to the `dist` directory and it can be run by using the command below:

```shell
npm run start
```

## Documentation

If you are running the API locally you also will find the documentation on path `/documentation` of you local instance.
