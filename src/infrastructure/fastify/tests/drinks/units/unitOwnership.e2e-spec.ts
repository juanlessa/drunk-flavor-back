import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

// Happy paths only: the refusals (403, 401, validation) are covered by the unit and integration tests.
type Cookies = Awaited<ReturnType<typeof createAndAuthenticateUser>>['cookies'];
type UnitBody = { id: string; translations: { en: { name: string } }; createdBy?: string; updatedBy?: string };

const unitNamed = (name: string) =>
	createUnitFactory({
		translations: { en: { name, namePlural: `${name}s` }, pt: { name: `${name} pt`, namePlural: `${name}s pt` } },
	});

const createUnitAs = async (cookies: Cookies, name: string) => {
	const response = await request(app.server).post('/units').set('Cookie', cookies).send(unitNamed(name));
	expect(response.status).toBe(HTTP_STATUS.created);
	const list = await request(app.server)
		.get('/units/me')
		.set('Cookie', cookies)
		.query({ search: JSON.stringify({ name }) });
	return (list.body as UnitBody[])[0];
};

const namesOf = (body: UnitBody[]) => body.map((unit) => unit.translations.en.name);

describe('Unit ownership', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('records the signed-in user as the creator and the last editor', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });

		const unit = await createUnitAs(cookies, 'cup');

		expect(unit).toMatchObject({ createdBy: user.id, updatedBy: user.id });
	});

	it('lets a partner update and delete a unit they created', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });
		const unit = await createUnitAs(cookies, 'cup');

		const update = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id: unit.id, ...unitNamed('cup'), allowDecimal: false });
		const edited = (await request(app.server).get('/units/me').set('Cookie', cookies)).body as UnitBody[];
		const remove = await request(app.server).delete('/units').set('Cookie', cookies).send({ id: unit.id });

		expect(update.status).toBe(HTTP_STATUS.no_content);
		expect(edited).toMatchObject([{ id: unit.id, createdBy: user.id, updatedBy: user.id }]);
		expect(remove.status).toBe(HTTP_STATUS.no_content);
	});

	it('lets an admin update a unit created by a partner, recording the admin as the last editor only', async () => {
		const partner = await createAndAuthenticateUser(app, { role: Roles.partner, email: 'partner@example.com' });
		const admin = await createAndAuthenticateUser(app, { role: Roles.admin, email: 'admin@example.com' });
		const unit = await createUnitAs(partner.cookies, 'cup');

		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', admin.cookies)
			.send({ id: unit.id, ...unitNamed('cup'), allowDecimal: false });

		expect(response.status).toBe(HTTP_STATUS.no_content);
		const listed = await request(app.server).get('/units/me').set('Cookie', admin.cookies);
		expect(listed.body).toMatchObject([{ id: unit.id, createdBy: partner.user.id, updatedBy: admin.user.id }]);
	});

	it('hides who created and last edited a unit from the public reads', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.partner });
		const unit = await createUnitAs(cookies, 'cup');

		const list = await request(app.server).get('/units');
		const single = await request(app.server).get(`/units/${unit.id}`);

		expect(list.status).toBe(HTTP_STATUS.ok);
		const [listed] = list.body as object[];
		expect(listed).not.toHaveProperty('createdBy');
		expect(listed).not.toHaveProperty('updatedBy');
		expect(single.body).not.toHaveProperty('createdBy');
		expect(single.body).not.toHaveProperty('updatedBy');
	});

	describe('listing with authorship (GET /units/me)', () => {
		it.each([Roles.partner, Roles.admin, Roles.owner])('is available to the %s', async (role) => {
			const { cookies } = await createAndAuthenticateUser(app, { role });

			const response = await request(app.server).get('/units/me').set('Cookie', cookies);

			expect(response.status).toBe(HTTP_STATUS.ok);
		});

		it('lists the units of the user first, then the others, with who created and last edited each one', async () => {
			const mine = await createAndAuthenticateUser(app, { role: Roles.partner, email: 'mine@example.com' });
			const theirs = await createAndAuthenticateUser(app, { role: Roles.partner, email: 'theirs@example.com' });
			await createUnitAs(theirs.cookies, 'apple');
			await createUnitAs(mine.cookies, 'zebra');
			const sort = JSON.stringify({ 'translations.en.name': 'asc' });

			const response = await request(app.server).get('/units/me').set('Cookie', mine.cookies).query({ sort });
			const alphabetical = await request(app.server).get('/units').query({ sort });

			expect(namesOf(response.body as UnitBody[])).toEqual(['zebra', 'apple']);
			expect(response.body).toMatchObject([
				{ createdBy: mine.user.id, updatedBy: mine.user.id },
				{ createdBy: theirs.user.id, updatedBy: theirs.user.id },
			]);
			expect(namesOf(alphabetical.body as UnitBody[])).toEqual(['apple', 'zebra']);
		});
	});
});
