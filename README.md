# DrunkFlavor

Welcome to DrunkFlavor, your ultimate destination for delicious alcoholic drink recipes! Whether you're a cocktail enthusiast or looking to impress your friends at your next gathering, DrunkFlavor is here to provide you with a wide array of enticing drink recipes to try in the comfort of your own home. From classic cocktails to our own adaptations, our carefully curated collection will satisfy all taste preferences. Explore our recipe database, complete with  instructions and ingredient lists, making it easy for you to recreate these delectable drinks. Get ready to elevate your mixology skills and discover the perfect libation for any occasion. Join our community and let DrunkFlavor be your go-to resource for all things drinks!

# Development

DrunkFlavor is a open source project, if you are interested in knowing more about its development, you will find below the link to the git repositories, as well as instructions to run it locally.  
Feel free to suggest improvements and report possible bugs, if you are a software developer pull requests are always welcome.  

 Github repositories:

* Backend: <https://github.com/juanlessa/drunk-flavor-back>
* Frontend: <https://github.com/juanlessa/drunk-flavor-front>

## Backend

## setup

### database

To run the Drunkflavor backend locally, you must have an instance of MongoDB.  
To install MongoDB on macOS, execute the command below.

```shell
brew install mongodb-community@6.0 
```

If you are using a different operating system, please refer to the installation guide on the [MongoDB website](https://www.mongodb.com) for instructions.

Make sure to enable the replica set option in your MongoDB single node by following these steps:
**Note:** in the code samples below, we will consider that your MongoDB instance is running on localhost at port 27017 (the default MongoDB port). If this is not the case for you, please modify this information as needed.

1. Start the MongoDB server in replSet mode by providing the --replSet parameter when starting the MongoDB process. For example:

    ```shell
    mongod --replSet=rs0
    ```

2. Connect to the MongoDB instance using the MongoDB shell.

    ```shell
    mongosh "mongodb://localhost:27017"
    ```

3. In the MongoDB shell, initiate the replica set by running the following command:

    ```shell
    rs.initiate({
        _id : "rs0",
        members: [ 
            { _id: 0, host: "localhost:27001" } 
        ] 
    })
    ```

4. Now, you can add the current node to the replica set by executing the following command:

    ```shell
    rs.add("localhost:27017")
    ```

5. Verify the replica set status to ensure that everything is configured correctly.

     ```shell
    rs.status()
    ```

Now your database environment is ready.

### API

### .env

To execute the Node.js API, you need to add a file named ```.env``` at the root project folder, containing the environment variables.
You can use the [```.env.example```](https://github.com/juanlessa/drunk-flavor-back/blob/master/.env.example) file and add the corresponding values for your environment, or simply copy the sample below:

```dotenv
# MongoDB
MONGO_ROOT_USERNAME='drunkflavor'
MONGO_ROOT_PASSWORD='drunkflavor'
MONGO_DATABASE='drunk-flavor'
MONGO_HOST='localhost'
MONGO_PORT='27017'

# Prisma database - do not change this variable
DATABASE_URL="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}"

# API
APP_HOST=http://localhost
APP_PORT=3333

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

