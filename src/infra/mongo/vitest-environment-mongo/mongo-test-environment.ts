import type { Environment } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoRepository } from '@/infra/mongo/Mongo.repository';
import { env } from '@/env';

let mongod: MongoMemoryServer | undefined = undefined;
let connectionString: string | undefined = undefined;

export default <Environment>{
	name: 'mongo',
	transformMode: 'ssr',

	async setup() {
		if (env.TESTING_MONGO_DATABASE_MODE === 'inMemory') {
			mongod = await MongoMemoryServer.create();
			connectionString = mongod.getUri();
		}

		await MongoRepository.Instance.start(connectionString);

		return {
			async teardown() {
				if (env.TESTING_MONGO_DATABASE_MODE === 'persistent') {
					await MongoRepository.Instance.dropAllCollections();
				}

				await MongoRepository.Instance.stop();

				if (env.TESTING_MONGO_DATABASE_MODE === 'inMemory' && mongod) {
					await mongod.stop();
				}
			},
		};
	},
};
