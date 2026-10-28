import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { RatingsRepository } from '@/core/engagement/infra/mongo/repositories/Ratings.repository';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { BadRequestError } from '@/shared/error/error.lib';

const query: RatingListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };
let repository: RatingsRepository;

describe('RatingsRepository (integration)', () => {
	beforeAll(async () => {
		await RatingModel.init();
	});

	afterEach(async () => {
		await RatingModel.deleteMany({});
		await MongoConnection.Instance.client.db().collection('drinks').deleteMany({});
	});

	describe('duplicate-pair classification', () => {
		it('translates a sequential duplicate pair to BadRequestError', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			await repository.create({ drinkId, userId, value: 4 });
			await expect(repository.create({ drinkId, userId, value: 2 })).rejects.toBeInstanceOf(BadRequestError);
		});

		it('resolves a concurrent create race to one record and one rejection', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			const results = await Promise.allSettled([
				repository.create({ drinkId, userId, value: 4 }),
				repository.create({ drinkId, userId, value: 5 }),
			]);
			expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
			expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
			expect(await RatingModel.countDocuments({ drink_id: drinkId, user_id: userId })).toBe(1);
		});

		it('does not mask a physical _id collision as a pair conflict', async () => {
			const sharedId = new ObjectId();
			await RatingModel.create({
				_id: sharedId,
				drink_id: new ObjectId().toString(),
				user_id: new ObjectId().toString(),
				value: 3,
			});
			const collision = RatingModel.create({
				_id: sharedId,
				drink_id: new ObjectId().toString(),
				user_id: new ObjectId().toString(),
				value: 4,
			});
			await expect(collision).rejects.not.toBeInstanceOf(BadRequestError);
		});
	});

	describe('mapping, reads, and deletes', () => {
		it('persists snake_case and returns camelCase without Mongo internals', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			const created = await repository.create({ drinkId, userId, value: 4 });
			const byId = await repository.findById(created.id);
			const byPair = await repository.findByDrinkAndUser(drinkId, userId);
			const persisted = await RatingModel.findById(created.id).lean();

			expect(byId).toMatchObject({ id: created.id, drinkId, userId });
			expect(byPair).toMatchObject({ id: created.id, drinkId, userId });
			expect(byId as Record<string, unknown>).not.toHaveProperty('_id');
			expect(persisted).toMatchObject({ drink_id: drinkId, user_id: userId });
		});

		it('resolves findByUser, findByDrink and findByDrinkAndUser correctly', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			await repository.create({ drinkId, userId, value: 4 });
			await repository.create({ drinkId, userId: new ObjectId().toString(), value: 3 });

			expect(await repository.findByDrink(drinkId, query)).toHaveLength(2);
			expect(await repository.findByUser(userId, query)).toHaveLength(1);
			expect(await repository.findByDrinkAndUser(drinkId, userId)).not.toBeNull();
			expect(await repository.findByDrinkAndUser(drinkId, new ObjectId().toString())).toBeNull();
		});

		it('returns exact bulk delete counts including zero on repeat', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			await repository.create({ drinkId, userId, value: 4 });
			await repository.create({ drinkId, userId: new ObjectId().toString(), value: 3 });

			expect(await repository.deleteByDrink(drinkId)).toBe(2);
			expect(await repository.deleteByDrink(drinkId)).toBe(0);
			expect(await repository.deleteByUser(userId)).toBe(0);
		});
	});

	it('maps createdAt and id sort fields to Mongo across pages', async () => {
		repository = new RatingsRepository();
		const userId = new ObjectId().toString();
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await RatingModel.collection.insertMany(
			ids.map((id) => ({
				_id: id,
				drink_id: new ObjectId().toString(),
				user_id: userId,
				value: 3,
				created_at: sharedDate,
				updated_at: sharedDate,
			})),
		);
		const expected = ids.map(String).sort((a, b) => (a > b ? -1 : 1));
		const first = await repository.findByUser(userId, { page: 1, limit: 2, sort: { createdAt: -1, id: -1 } });
		const second = await repository.findByUser(userId, { page: 2, limit: 2, sort: { createdAt: -1, id: -1 } });

		expect(first.map((rating) => rating.id)).toEqual(expected.slice(0, 2));
		expect(second.map((rating) => rating.id)).toEqual(expected.slice(2));
	});

	it('does not mutate Drink aggregates on create, update, or delete', async () => {
		repository = new RatingsRepository();
		const drinks = MongoConnection.Instance.client.db().collection('drinks');
		const drinkId = new ObjectId();
		await drinks.insertOne({
			_id: drinkId,
			avg_rating: 3.5,
			ratings_count: 8,
			created_at: new Date(),
			updated_at: new Date(),
		});
		const created = await repository.create({
			drinkId: drinkId.toString(),
			userId: new ObjectId().toString(),
			value: 5,
		});
		await repository.update({ id: created.id, value: 2 });
		await repository.delete(created.id);

		const drink = await drinks.findOne({ _id: drinkId });
		expect(drink?.avg_rating).toBe(3.5);
		expect(drink?.ratings_count).toBe(8);
	});
});
