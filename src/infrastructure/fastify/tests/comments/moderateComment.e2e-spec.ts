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
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createCommentRecord } from '../helpers/comment.helpers';

describe('Moderate Comment', () => {
	beforeAll(async () => {
		await app.ready();
		await CommentModel.init();
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
		await MongoConnection.Instance.emptyCollection(CommentModel);
	});

	it('Should be able to moderate a comment as an Admin', async () => {
		const { id } = await createCommentRecord({ content: 'first' });

		const member = await createAndAuthenticateUser(app, { role: Roles.member, email: 'member@example.com' });
		const memberResponse = await request(app.server)
			.patch(`/comments/${id}/status`)
			.set('Cookie', member.cookies)
			.send({ status: CommentStatuses.hidden });
		expect(memberResponse.status).toBe(HTTP_STATUS.forbidden);

		const admin = await createAndAuthenticateUser(app, { role: Roles.admin, email: 'admin@example.com' });
		const adminResponse = await request(app.server)
			.patch(`/comments/${id}/status`)
			.set('Cookie', admin.cookies)
			.send({ status: CommentStatuses.hidden });
		expect(adminResponse.status).toBe(HTTP_STATUS.no_content);
		const stored = await CommentModel.findById(id).lean();
		expect(stored?.status).toBe(CommentStatuses.hidden);
	});
});
