import mongoose, { Model, Mongoose } from 'mongoose';
import mongoConfig from '@config/mongo';
import { resolveLoggerProvider } from '@shared/container/providers/logger';

const logger = resolveLoggerProvider();

let mongoClient: Mongoose;

export async function initiateMongo(): Promise<void> {
	const connectURL = `mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}?${mongoConfig.params}`;
	try {
		mongoClient = await mongoose.connect(connectURL, {
			maxPoolSize: mongoConfig.maxPoolSize,
			serverSelectionTimeoutMS: mongoConfig.serverSelectionTimeoutMS,
			connectTimeoutMS: mongoConfig.connectTimeoutMS
		});
		logger.info('Mongo connection has been stablish.');
	} catch (error) {
		logger.error(error as Error, 'Mongo could not connect');
		throw new Error('MongoDB could not connect', error as Error);
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
