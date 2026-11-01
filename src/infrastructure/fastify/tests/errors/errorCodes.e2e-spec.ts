import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import en from '@/shared/locales/en.json';

type FieldErrorBody = {
	path: string;
	localeKey: keyof typeof en;
	params?: Record<string, number>;
	message: string;
};
type ErrorBody = { ok: boolean; code: string; localeKey: keyof typeof en; message: string; errors?: FieldErrorBody[] };

describe('Error codes', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(TokenModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
	});

	it('answers a missing resource with 404 and the NOT_FOUND group', async () => {
		const response = await request(app.server).get(`/units/${new ObjectId().toString()}`);
		const body = response.body as ErrorBody;

		expect(response.status).toBe(HTTP_STATUS.not_found);
		expect(body).toMatchObject({ ok: false, code: 'NOT_FOUND', localeKey: 'apiResponses.units.notFound' });
	});

	it('answers a duplicated resource with 409 and the CONFLICT group', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const unit = createUnitFactory();
		await request(app.server).post('/units').set('Cookie', cookies).send(unit);

		const response = await request(app.server).post('/units').set('Cookie', cookies).send(unit);

		expect(response.status).toBe(HTTP_STATUS.conflict);
		expect(response.body as ErrorBody).toMatchObject({
			ok: false,
			code: 'CONFLICT',
			localeKey: 'apiResponses.units.alreadyExist',
		});
	});

	it('answers a repeated signup with 409 and the CONFLICT group', async () => {
		const { name, surname, email } = createUserFactory({ email: 'repeated@example.com' });
		const payload = { name, surname, email, password: 'Password-12345678' };
		await request(app.server).post('/signup').send(payload);

		const response = await request(app.server).post('/signup').send(payload);

		expect(response.status).toBe(HTTP_STATUS.conflict);
		expect((response.body as ErrorBody).code).toBe('CONFLICT');
	});

	it('answers a denied permission with 403 and FORBIDDEN, not as a credentials failure', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.member });

		const response = await request(app.server).post('/units').set('Cookie', cookies).send(createUnitFactory());

		expect(response.status).toBe(HTTP_STATUS.forbidden);
		expect(response.body as ErrorBody).toMatchObject({
			code: 'FORBIDDEN',
			localeKey: 'apiResponses.auth.insufficientPermissions',
		});
	});

	it('answers wrong credentials with 401 and the INVALID_CREDENTIALS group', async () => {
		const response = await request(app.server)
			.post('/signin')
			.send({ email: 'nobody@example.com', password: 'Password-12345678' });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
		expect(response.body as ErrorBody).toMatchObject({
			code: 'INVALID_CREDENTIALS',
			localeKey: 'apiResponses.auth.invalidCredentials',
		});
	});

	it('answers a schema failure with VALIDATION_FAILED and exposes rule limits as params', async () => {
		const { name, surname, email } = createUserFactory();

		const response = await request(app.server).post('/signup').send({ name, surname, email, password: 'a' });
		const body = response.body as ErrorBody;
		const tooShort = body.errors?.find((error) => error.localeKey === 'apiResponses.users.invalidPasswordMinSize');

		expect(response.status).toBe(HTTP_STATUS.bad_request);
		expect(body).toMatchObject({ code: 'VALIDATION_FAILED', localeKey: 'apiResponses.validation.failed' });
		expect(tooShort).toMatchObject({ path: 'password', params: { min: 8 } });
		expect(tooShort?.message).toBe('Password must have a minimum of 8 characters');
	});
});
