import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createDrink } from '../helpers/drink.helpers';

const storageProvider = vi.hoisted(() => ({
	getFileURL: vi.fn((fileName: string) => `http://storage.test/${fileName}`),
	deleteFile: vi.fn(async () => undefined),
	uploadFile: vi.fn(async () => undefined),
}));

vi.mock('@/shared/providers/storage', () => ({
	resolveStorageProvider: () => storageProvider,
}));

let storedFileNames: string[] = [];

describe('Update drink images', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		storedFileNames = [];
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	afterEach(async () => {
		await Promise.all(storedFileNames.map((fileName) => resolveStorageProvider().deleteFile(fileName)));
	});

	it('uploads cover and thumbnail through multipart routes and returns their metadata', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createDrink();

		const coverResponse = await request(app.server)
			.patch(`/drinks/${id}/cover`)
			.set('Cookie', cookies)
			.attach('file', Buffer.from('cover-image'), { filename: 'cover.png', contentType: 'image/png' });
		const thumbnailResponse = await request(app.server)
			.patch(`/drinks/${id}/thumbnail`)
			.set('Cookie', cookies)
			.attach('file', Buffer.from('thumbnail-image'), { filename: 'thumbnail.png', contentType: 'image/png' });

		expect(coverResponse.status).toBe(HTTP_STATUS.no_content);
		expect(thumbnailResponse.status).toBe(HTTP_STATUS.no_content);
		const persisted = await DrinkModel.findById(id).lean();
		expect(persisted?.cover).toMatchObject({ mimetype: 'image/png', url: '' });
		expect(persisted?.thumbnail).toMatchObject({ mimetype: 'image/png', url: '' });
		storedFileNames = [persisted?.cover?.name, persisted?.thumbnail?.name].filter(
			(fileName): fileName is string => fileName !== undefined,
		);

		const response = await request(app.server).get(`/drinks/${id}`).send();
		const body = response.body as {
			id: string;
			cover: { name: string; mimetype: string; url: string };
			thumbnail: { name: string; mimetype: string; url: string };
		};
		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(body).toMatchObject({
			id,
			cover: { mimetype: 'image/png' },
			thumbnail: { mimetype: 'image/png' },
		});
		expect(body.cover.url).toBe(`http://storage.test/${body.cover.name}`);
		expect(body.thumbnail.url).toBe(`http://storage.test/${body.thumbnail.name}`);
		expect(storageProvider.uploadFile).toHaveBeenCalledTimes(2);
	});
});
