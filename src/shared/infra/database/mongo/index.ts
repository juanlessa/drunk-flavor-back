import mongoose, { Model, Mongoose } from 'mongoose';

let mongoClient: Mongoose;

export async function initiateMongo(): Promise<void> {
	const mongoHost = process.env.MONGO_HOST || 'localhost';
	const mongoPort = process.env.MONGO_PORT || '27017';
	const mongoMaxPoolSize = process.env.MONGO_MAX_POOL_SIZE || '25';
	const mongoDb = process.env.MONGO_DATABASE || 'drunkflavor';
	const mongoAuthDb = process.env.MONGO_AUTH_DB || 'admin';
	const mongoUser = process.env.MONGO_USERNAME || '';
	const mongoPwd = process.env.MONGO_PASSWORD;
	//const params = `authMechanism=SCRAM-SHA-256&authSource=${mongoAuthDb}`;
	const params = ``;

	try {
		mongoClient = await mongoose.connect(
			`mongodb://${mongoUser}:${mongoPwd}@${mongoHost}:${mongoPort}/${mongoDb}?${params}`,
			{ maxPoolSize: parseInt(mongoMaxPoolSize), serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 }
		);
		console.log('[INFO] Mongo connection has been stablish.');
	} catch (error) {
		console.error('Could not connect ', error);
		throw new Error(error);
	}
}

export function getMongoClient(): Mongoose {
	return mongoClient;
}

export const closeConnection = async () => {
	await mongoClient.connection.close();
};

export const dropCollection = async (model: Model<any>) => {
	const collectionsList = Object.keys(mongoClient.connection.collections);
	const collectionToDeleteName = model.collection.collectionName;
	if (collectionsList.includes(collectionToDeleteName)) {
		await mongoClient.connection.dropCollection(collectionToDeleteName);
	}
};
export const emptyCollection = async (model: Model<any>) => {
	const collectionName = model.collection.collectionName;
	await mongoClient.connection.collection(collectionName).deleteMany({});
};
