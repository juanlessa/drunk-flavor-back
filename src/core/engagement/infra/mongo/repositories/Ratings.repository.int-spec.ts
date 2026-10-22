import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { RatingsRepository } from '@/core/engagement/infra/mongo/repositories/Ratings.repository';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { BadRequestError } from '@/shared/error/error.lib';

const query: RatingListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let repository: RatingsRepository;

describe('RatingsRepository (integration)', () => {
	beforeAll(async () => {
		await RatingModel.init();
	});

	afterEach(async () => {
		await RatingModel.deleteMany({});
		// Clean the drinks collection used by the aggregate sentinel test.
		await MongoConnection.Instance.client.db().collection('drinks').deleteMany({});
	});

	describe('duplicate-pair classification', () => {
		it('translates a sequential duplicate (drink_id, user_id) to BadRequestError', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();

			await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });

			await expect(repository.create({ drink_id: drinkId, user_id: userId, value: 2 })).rejects.toBeInstanceOf(
				BadRequestError,
			);
		});

		it('resolves a concurrent create race to exactly one persisted record and one rejection', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();

			const results = await Promise.allSettled([
				repository.create({ drink_id: drinkId, user_id: userId, value: 4 }),
				repository.create({ drink_id: drinkId, user_id: userId, value: 5 }),
			]);

			const fulfilled = results.filter((result) => result.status === 'fulfilled');
			const rejected = results.filter((result) => result.status === 'rejected');
			expect(fulfilled).toHaveLength(1);
			expect(rejected).toHaveLength(1);

			const persisted = await RatingModel.countDocuments({ drink_id: drinkId, user_id: userId });
			expect(persisted).toBe(1);
		});

		it('rethrows a non-pair duplicate (_id collision) instead of masking it as a pair conflict', async () => {
			repository = new RatingsRepository();
			const sharedId = new ObjectId();

			// Seed a record with a controlled _id directly through the model, since
			// the repository CreateRating DTO does not accept _id.
			await RatingModel.create({
				_id: sharedId,
				drink_id: new ObjectId().toString(),
				user_id: new ObjectId().toString(),
				value: 3,
			});

			// Force a second document with the same _id but a different pair. The
			// resulting 11000 error is on _id, not the pair index, so it must not be
			// translated to BadRequestError.
			const collision = RatingModel.create({
				_id: sharedId,
				drink_id: new ObjectId().toString(),
				user_id: new ObjectId().toString(),
				value: 4,
			});

			await expect(collision).rejects.not.toBeInstanceOf(BadRequestError);
		});
	});

	describe('reads and deletes', () => {
		it('returns lean documents without __v', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			const created = await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });

			const byId = await repository.findById(created._id.toString());
			const byPair = await repository.findByDrinkAndUser(drinkId, userId);

			expect(byId).not.toBeNull();
			expect(byPair).not.toBeNull();
			expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
			expect(byPair as Record<string, unknown>).not.toHaveProperty('__v');
		});

		it('resolves findByUser, findByDrink and findByDrinkAndUser correctly', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			const otherUser = new ObjectId().toString();

			await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
			await repository.create({ drink_id: drinkId, user_id: otherUser, value: 3 });

			expect((await repository.findByDrink(drinkId, query)).length).toBe(2);
			expect((await repository.findByUser(userId, query)).length).toBe(1);
			expect(await repository.findByDrinkAndUser(drinkId, userId)).not.toBeNull();
			expect(await repository.findByDrinkAndUser(drinkId, new ObjectId().toString())).toBeNull();
		});

		it('returns exact bulk delete counts including zero on repeat', async () => {
			repository = new RatingsRepository();
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();

			await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
			await repository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), value: 3 });

			expect(await repository.deleteByDrink(drinkId)).toBe(2);
			expect(await repository.deleteByDrink(drinkId)).toBe(0);
			expect(await repository.deleteByUser(userId)).toBe(0);
		});
	});

	describe('sort and pagination', () => {
		it('honors created_at desc with _id desc tie-breaker across pages', async () => {
			repository = new RatingsRepository();
			const userId = new ObjectId().toString();
			const sharedDate = new Date('2024-01-01T00:00:00.000Z');

			// Three ratings sharing the same created_at so ordering falls back to the
			// _id desc tie-breaker. Insert directly to control _id and timestamps.
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

			const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

			const firstPage = await repository.findByUser(userId, {
				page: 1,
				limit: 2,
				sort: { created_at: -1, _id: -1 },
			});
			const secondPage = await repository.findByUser(userId, {
				page: 2,
				limit: 2,
				sort: { created_at: -1, _id: -1 },
			});

			expect(firstPage.map((rating) => rating._id.toString())).toEqual(expectedOrder.slice(0, 2));
			expect(secondPage.map((rating) => rating._id.toString())).toEqual(expectedOrder.slice(2, 3));
		});
	});

	describe('Drink aggregate sentinel', () => {
		it('does not mutate Drink avg_rating or ratings_count on create/update/delete', async () => {
			repository = new RatingsRepository();
			// Seed a drink through the raw driver to avoid a cross-core production
			// import (the engagement module must not import @/core/drinks).
			const drinks = MongoConnection.Instance.client.db().collection('drinks');
			const drinkId = new ObjectId();
			await drinks.insertOne({
				_id: drinkId,
				avg_rating: 3.5,
				ratings_count: 8,
				created_at: new Date(),
				updated_at: new Date(),
			});

			const drinkIdString = drinkId.toString();
			const userId = new ObjectId().toString();

			const created = await repository.create({ drink_id: drinkIdString, user_id: userId, value: 5 });
			await repository.update({ id: created._id.toString(), value: 2 });
			await repository.delete(created._id.toString());

			const drink = await drinks.findOne({ _id: drinkId });
			expect(drink?.avg_rating).toBe(3.5);
			expect(drink?.ratings_count).toBe(8);
		});
	});
});
