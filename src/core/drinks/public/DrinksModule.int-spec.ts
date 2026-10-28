import { afterEach, describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { resolveDrinksModule } from './index';

describe('DrinksModule public API (integration)', () => {
	afterEach(async () => {
		await DrinkModel.deleteMany({});
	});

	it('finds a drink by id through the public resolver and returns the camelCase domain entity', async () => {
		const document = await DrinkModel.create({
			translations: {
				en: { name: 'Gimlet', method: 'Shake with ice' },
				pt: { name: 'Gimlet', method: 'Agite com gelo' },
			},
			ingredients: [],
			avg_rating: 4,
			ratings_count: 2,
			ratings_sum: 8,
		});

		const drink = await resolveDrinksModule().findDrinkById(document._id.toHexString());

		expect(drink).toMatchObject({
			id: document._id.toHexString(),
			avgRating: 4,
			ratingsCount: 2,
			ratingsSum: 8,
		});
		expect(drink).not.toHaveProperty('_id');
		expect(drink).not.toHaveProperty('avg_rating');
		expect(drink).not.toHaveProperty('ratings_count');
		expect(drink).not.toHaveProperty('ratings_sum');
	});

	it('returns null when the public resolver cannot find the drink id', async () => {
		await expect(resolveDrinksModule().findDrinkById(new Types.ObjectId().toHexString())).resolves.toBeNull();
	});
});
