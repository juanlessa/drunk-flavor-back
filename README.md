# DrunkFlavor

Welcome to DrunkFlavor, your ultimate destination for delicious alcoholic drink recipes! Whether you're a cocktail enthusiast or looking to impress your friends at your next gathering, DrunkFlavor is here to provide you with a wide array of enticing drink recipes to try in the comfort of your own home. From classic cocktails to our own adaptations, our carefully curated collection will satisfy all taste preferences. Explore our recipe database, complete with  instructions and ingredient lists, making it easy for you to recreate these delectable drinks. Get ready to elevate your mixology skills and discover the perfect libation for any occasion. Join our community and let DrunkFlavor be your go-to resource for all things drinks!

# Development

DrunkFlavor is a open source project, if you are interested in knowing more about its development, you will find below the link to the git repositories, as well as instructions to run it locally.  
Feel free to suggest improvements and report possible bugs, if you are a software developer pull requests are always welcome.  

 Github repositories:

* Backend: <https://github.com/juanlessa/drunk-flavor-back>
* Frontend: <https://github.com/juanlessa/drunk-flavor-front>

## Backend

- [Setup](#setup)
  - [mongodb](#mongodb)
  - [node.js](#nodejs)
  - [dotenv](#dotenv)
- [Dev](#dev)
- [Testing](#dev)
- [Build](#build)
- [Documentation](#documentation)

## Setup

### mongodb

To run the Drunkflavor backend locally, you must have an instance of MongoDB.  
To install MongoDB on macOS, execute the command below.

```shell
brew install mongodb-community@6.0 
```

If you are using a different operating system, please refer to the installation guide on the [MongoDB website](https://www.mongodb.com) for instructions.

### node.js

To run our API locally, you will need to have Node.js 16 or higher installed on your machine.
To install Node.js on macOS, execute the command below.

```shell
brew install node
```

If you are using a different operating system, please refer to the installation guide on the [Node.js website](https://nodejs.org) for instructions.

You can run the commands below to check the versions of the node.js and npm.

```shell
$ node --version                     
v16.17.0

$ npm --version    
8.15.0
```

 Make sure that your node.js and npm versions are equal to or higher than these ones.

Finally run the command bellow to install the project dependencies.

```shell
npm install
````

Now your node.js setup is ready.

### dotenv

To execute the Node.js API, you need to add a file named ```.env``` at the root project folder, containing the environment variables.
You can use the [```.env.example```](https://github.com/juanlessa/drunk-flavor-back/blob/master/.env.example) file and add the corresponding values for your environment, or simply copy the sample below:

```dotenv
# MongoDB
MONGO_USERNAME='drunkflavor'
MONGO_PASSWORD='drunkflavor'
MONGO_DATABASE='drunk-flavor'
MONGO_HOST='localhost'
MONGO_PORT='27017'
MONGO_PARAMS=''

# Environment
NODE_ENV=dev

# API
API_HOST=http://localhost
API_PORT=3333

# Logger
LOGGER_ENABLED='true'
LOGGER_LEVEL='debug'

# Storage - do not change this variable
STORAGE_TYPE=local

# Auth
TOKEN_SECRET='bad-token-secret'
TOKEN_EXPIRES_IN='4h'
TOKEN_EXPIRES_HOURS=4
REFRESH_TOKEN_SECRET='bad-refresh-token-secret'
REFRESH_TOKEN_EXPIRES_IN='15d'
REFRESH_TOKEN_EXPIRES_DAYS='15'
```

**Notes:**

* This sample is considering that you did the MongoDB default installation. If this is not the case for you, please modify the ```# MongoBD``` variables to match with your database information's.
* We do recommend you change the ```TOKEN_SECRET``` and the ```REFRESH_TOKEN_SECRET``` values, you can just generate to random strings and place there

Now your environment setup is ready.

## Dev

Once your setup is ready, you are able to run the drunkflavor API in development mode by using the command below.

```shell
npm run dev
```

You can also run in watch mode to automatically rerun on file changes:

```shell
npm run dev:debug
```

**Note:** make sure that when running the commands above, your MongoDB instance is available.

On macOS, you can execute the command below to start the MongoDB service.

```shell
brew services start mongodb-community@6.0     
```

If you are using a different operating system, please refer to the documentation on the [MongoDB website](https://www.mongodb.com).

## Testing
In our project, we use Vitest as our testing library.

The unit tests (.spec.ts fales) can be run by using the command below.
```shel
npm run test
```

For the integration tests (.e2e-spec.ts fales) you need to add a file named ```.env.testing``` at the root project folder, containing the testing database environment variables. You can use the sample below changing the values to your mongodb testing database:

```dotenv
# MongoDB
MONGO_USERNAME='drunkflavor'
MONGO_PASSWORD='drunkflavor'
MONGO_DATABASE='drunk-flavor'
MONGO_HOST='localhost'
MONGO_PORT='27017'
MONGO_PARAMS=''

# Environment
NODE_ENV=testing

# Logger
LOGGER_ENABLED='false'
LOGGER_LEVEL='error'
```

after that you can run the integration tests by using the command below:
```shel
npm run test:e2e
```

## Build
You can build the project by using the command below:

```shell
npm run build
```

The build result will be added to the ```dist``` directory and it can be run by using the command below:

```shell
npm run start
```

## Documentation

If you are running the API locally you also will find the documentation on path ```/api-docs``` of you local instance.
