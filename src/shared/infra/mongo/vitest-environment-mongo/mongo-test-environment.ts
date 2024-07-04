import { MongoRepository } from '@/shared/infra/mongo/Mongo.repository';
import type { Environment } from 'vitest';

export default <Environment>{
	name: 'mongo',
	transformMode: 'ssr',

	async setup() {
		await MongoRepository.Instance.start();

		return {
			async teardown() {
				await MongoRepository.Instance.dropAllCollections();
				await MongoRepository.Instance.stop();
			},
		};
	},
};
