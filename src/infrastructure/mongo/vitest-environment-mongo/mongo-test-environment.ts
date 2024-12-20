import type { Environment } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { env } from '@/env';

let mongod: MongoMemoryServer | undefined = undefined;
let connectionString: string | undefined = undefined;

export default <Environment>{
	name: 'mongo',
	transformMode: 'ssr',

	async setup() {
		if (env.MONGO_PERSISTENCE_MODE === 'inMemory') {
			mongod = await MongoMemoryServer.create();
			connectionString = mongod.getUri();
		}

		await MongoRepository.Instance.start(connectionString);

		return {
			async teardown() {
				if (env.MONGO_PERSISTENCE_MODE === 'inDisk') {
					await MongoRepository.Instance.dropAllCollections();
				}

				await MongoRepository.Instance.stop();

				if (env.MONGO_PERSISTENCE_MODE === 'inMemory' && mongod) {
					await mongod.stop();
				}
			},
		};
	},
};
