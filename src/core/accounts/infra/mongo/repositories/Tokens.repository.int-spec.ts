import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { TokensRepository } from './Tokens.repository';
import { TokenModel } from '../entities/token.model';
import { CreateToken } from '@/core/accounts/dtos/token.dtos';
import { TokenHashAlreadyExistsError, TokenUserTypeAlreadyExistsError } from '@/core/accounts/errors/token.errors';
import { NotFoundError } from '@/shared/error/error.lib';

const buildToken = (overrides?: Partial<CreateToken>): CreateToken => ({
	tokenHash: overrides?.tokenHash ?? new ObjectId().toString(),
	userId: overrides?.userId ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000),
});

let repository: TokensRepository;

describe('TokensRepository (integration)', () => {
	beforeAll(async () => {
		await TokenModel.init();
	});
	beforeEach(() => {
		repository = new TokensRepository();
	});
	afterEach(async () => {
		await TokenModel.deleteMany({});
	});

	it('returns camelCase tokens without __v on every read', async () => {
		const created = await repository.create(buildToken());
		const byId = await repository.findById(created.id);
		const byToken = await repository.findByTokenHash(created.tokenHash);
		const byPair = await repository.findByUserIdAndType({ userId: created.userId, type: created.type });
		const [byUser] = await repository.findByUserId(created.userId);
		for (const token of [byId, byToken, byPair, byUser]) {
			expect(token as Record<string, unknown>).not.toHaveProperty('__v');
			expect(token as Record<string, unknown>).not.toHaveProperty('token_hash');
		}
	});

	it('persists token fields on create', async () => {
		const expiresAt = new Date('2030-01-01T00:00:00.000Z');
		const data = buildToken({ type: 'forgot-password', expiresAt });
		const created = await repository.create(data);
		expect(created.tokenHash).toBe(data.tokenHash);
		expect(created.userId).toBe(data.userId);
		expect(created.type).toBe('forgot-password');
		expect(created.expiresAt.getTime()).toBe(expiresAt.getTime());
	});

	it('findByTokenHash returns the matching token and null on no match', async () => {
		const created = await repository.create(buildToken());
		expect((await repository.findByTokenHash(created.tokenHash))?.tokenHash).toBe(created.tokenHash);
		expect(await repository.findByTokenHash(new ObjectId().toString())).toBeNull();
	});

	it('findByUserIdAndType returns the right token and null for a missing pair', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildToken({ userId, type: 'email-verification' }));
		await repository.create(buildToken({ userId, type: 'forgot-password' }));
		expect((await repository.findByUserIdAndType({ userId, type: 'email-verification' }))?.type).toBe(
			'email-verification',
		);
		expect((await repository.findByUserIdAndType({ userId, type: 'forgot-password' }))?.type).toBe(
			'forgot-password',
		);
		expect(
			await repository.findByUserIdAndType({ userId: new ObjectId().toString(), type: 'email-verification' }),
		).toBeNull();
	});

	it('findByUserId returns all user tokens and excludes others', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildToken({ userId, type: 'email-verification' }));
		await repository.create(buildToken({ userId, type: 'forgot-password' }));
		await repository.create(buildToken());
		expect(await repository.findByUserId(userId)).toHaveLength(2);
	});

	it('deleteByUserId removes only user tokens and returns the exact count', async () => {
		const userId = new ObjectId().toString();
		const otherUser = new ObjectId().toString();
		await repository.create(buildToken({ userId, type: 'email-verification' }));
		await repository.create(buildToken({ userId, type: 'forgot-password' }));
		await repository.create(buildToken({ userId: otherUser }));
		expect(await repository.deleteByUserId(userId)).toBe(2);
		expect(await repository.deleteByUserId(userId)).toBe(0);
		expect(await repository.findByUserId(otherUser)).toHaveLength(1);
	});

	it('updates a token and supports valid and invalid id lookups', async () => {
		const created = await repository.create(buildToken());
		const nextExpiration = new Date('2030-01-01T00:00:00.000Z');

		const updated = await repository.update({
			id: created.id,
			tokenHash: 'updated-token-hash',
			expiresAt: nextExpiration,
		});

		expect(updated).toMatchObject({ tokenHash: 'updated-token-hash', expiresAt: nextExpiration });
		expect((await repository.findById(created.id))?.id).toBe(created.id);
		expect(await repository.findById('invalid-id')).toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing or invalid id', async () => {
		await expect(repository.update({ id: new ObjectId().toString(), tokenHash: 'x' })).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.update({ id: 'invalid-id', tokenHash: 'x' })).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete('invalid-id')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('translates a duplicate token hash to a semantic token error', async () => {
		const tokenHash = new ObjectId().toString();
		await repository.create(buildToken({ tokenHash }));
		await expect(repository.create(buildToken({ tokenHash }))).rejects.toBeInstanceOf(TokenHashAlreadyExistsError);
	});

	it('translates a duplicate user and type pair to a semantic token error', async () => {
		const userId = new ObjectId().toString();
		await repository.create(buildToken({ userId, type: 'forgot-password' }));
		await expect(repository.create(buildToken({ userId, type: 'forgot-password' }))).rejects.toBeInstanceOf(
			TokenUserTypeAlreadyExistsError,
		);
	});

	it('resolves concurrent duplicate-token creation to one record and one rejection', async () => {
		const tokenHash = new ObjectId().toString();
		const results = await Promise.allSettled([
			repository.create(buildToken({ tokenHash })),
			repository.create(buildToken({ tokenHash })),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(TokenHashAlreadyExistsError);
		expect(await TokenModel.countDocuments({ token_hash: tokenHash })).toBe(1);
	});

	it('resolves concurrent duplicate user/type creation to one record and one rejection', async () => {
		const userId = new ObjectId().toString();
		const results = await Promise.allSettled([
			repository.create(buildToken({ userId, type: 'forgot-password' })),
			repository.create(buildToken({ userId, type: 'forgot-password' })),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(TokenUserTypeAlreadyExistsError);
		expect(await TokenModel.countDocuments({ user_id: userId, type: 'forgot-password' })).toBe(1);
	});
});
