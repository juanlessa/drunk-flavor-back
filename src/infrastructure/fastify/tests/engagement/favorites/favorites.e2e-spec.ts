import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Roles } from '@/shared/accessControl/roles';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { FavoriteModel } from '@/core/engagement/infra/mongo/entities/favorite.model';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { createDrink } from '@/infrastructure/fastify/tests/drinks/helpers/drink.helpers';
import { createFavoriteRecord } from '@/infrastructure/fastify/tests/engagement/helpers/favorite.helpers';

type FavoritesPage = { items: { drinkId: string; drink: { id: string } }[]; nextCursor: string | null };

describe('Favorites', () => {
	beforeAll(async () => {
		await app.ready();
		await FavoriteModel.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(FavoriteModel);
	});

	it('Should be able to add a favorite', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: drinkId } = await createDrink();

		const response = await request(app.server).put(`/me/favorites/${drinkId}`).set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await FavoriteModel.countDocuments({ drink_id: drinkId, user_id: user.id })).toBe(1);
	});

	it('Should be able to remove a favorite', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: drinkId } = await createDrink();
		await createFavoriteRecord({ drinkId, userId: user.id });

		const response = await request(app.server).delete(`/me/favorites/${drinkId}`).set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await FavoriteModel.countDocuments({ drink_id: drinkId, user_id: user.id })).toBe(0);
	});

	it('Should be able to list the favorites with their drinks, one page at a time', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: firstDrinkId, drink: firstDrink, ingredient } = await createDrink();
		const drinkIds = [firstDrinkId];
		for (let index = 1; index < 3; index++) {
			const { id } = await resolveDrinksRepository().create({
				translations: {
					en: { name: `Favorite ${index}`, method: 'Stir' },
					pt: { name: `Favorito ${index}`, method: 'Mexa' },
				},
				createdBy: FACTORY_CREATOR_ID,
				ingredients: firstDrink.ingredients.map((line) => ({ ...line, ingredient })),
			});
			drinkIds.push(id);
		}
		for (const drinkId of drinkIds) await createFavoriteRecord({ drinkId, userId: user.id });

		const first = await request(app.server).get('/me/favorites').query({ limit: 2 }).set('Cookie', cookies).send();
		const firstBody = first.body as FavoritesPage;
		const second = await request(app.server)
			.get('/me/favorites')
			.query({ limit: 2, cursor: firstBody.nextCursor })
			.set('Cookie', cookies)
			.send();
		const secondBody = second.body as FavoritesPage;

		expect(first.status).toBe(HTTP_STATUS.ok);
		expect(second.status).toBe(HTTP_STATUS.ok);
		expect(secondBody.nextCursor).toBeNull();
		const listed = [...firstBody.items, ...secondBody.items];
		expect(listed.map((item) => item.drinkId)).toEqual([...drinkIds].reverse());
		expect(listed.every((item) => item.drink.id === item.drinkId)).toBe(true);
	});

	it('Should be able to list the ids of the favorite drinks', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: drinkId } = await createDrink();
		await createFavoriteRecord({ drinkId, userId: user.id });

		const response = await request(app.server).get('/me/favorites/ids').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toEqual({ drinkIds: [drinkId] });
	});
});
