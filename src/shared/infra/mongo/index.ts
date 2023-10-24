import { PinoLogger } from '@shared/container/providers/logger/implementations/PinoLogger.provider';
import mongoose, { Model, Mongoose } from 'mongoose';
import { container } from 'tsyringe';
import mongoConfig from '@config/mongo';

const logger = container.resolve(PinoLogger);

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
		logger.error('Mongo could not connect ', error);
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
