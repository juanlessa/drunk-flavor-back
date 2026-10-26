import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { TokensRepository } from './Tokens.repository';
import { TokenModel } from '../entities/token.model';
import { CreateToken } from '@/core/accounts/dtos/token.dtos';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const buildToken = (overrides?: Partial<CreateToken>): CreateToken => ({
	token_hash: overrides?.token_hash ?? new ObjectId().toString(),
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expires_at: overrides?.expires_at ?? new Date(Date.now() + 60 * 60 * 1000),
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

	it('returns lean documents without __v on every read', async () => {
		const created = await repository.create(buildToken());

		const byId = await repository.findById(created._id.toString());
		const byToken = await repository.findByTokenHash(created.token_hash);
		const byPair = await repository.findByUserIdAndType({ user_id: created.user_id, type: created.type });
		const [byUser] = await repository.findByUserId(created.user_id);

		for (const doc of [byId, byToken, byPair, byUser]) {
			expect(doc as Record<string, unknown>).not.toHaveProperty('__v');
		}
	});

	it('persists token, user_id, type and expires_at on create', async () => {
		const expires_at = new Date('2030-01-01T00:00:00.000Z');
		const data = buildToken({ type: 'forgot-password', expires_at });

		const created = await repository.create(data);

		expect(created.token_hash).toBe(data.token_hash);
		expect(created.user_id).toBe(data.user_id);
		expect(created.type).toBe('forgot-password');
		expect(created.expires_at.getTime()).toBe(expires_at.getTime());
	});

	it('findByTokenHash returns the matching token and null on no match', async () => {
		const created = await repository.create(buildToken());

		expect((await repository.findByTokenHash(created.token_hash))?.token_hash).toBe(created.token_hash);
		expect(await repository.findByTokenHash(new ObjectId().toString())).toBeNull();
	});

	it('findByUserIdAndType returns the right token and null when the pair does not exist', async () => {
		const user_id = new ObjectId().toString();
		await repository.create(buildToken({ user_id, type: 'email-verification' }));
		await repository.create(buildToken({ user_id, type: 'forgot-password' }));

		const verification = await repository.findByUserIdAndType({ user_id, type: 'email-verification' });
		const reset = await repository.findByUserIdAndType({ user_id, type: 'forgot-password' });

		expect(verification?.type).toBe('email-verification');
		expect(reset?.type).toBe('forgot-password');
		expect(
			await repository.findByUserIdAndType({ user_id: new ObjectId().toString(), type: 'email-verification' }),
		).toBeNull();
	});

	it('findByUserId returns all of a user tokens and excludes others', async () => {
		const user_id = new ObjectId().toString();
		await repository.create(buildToken({ user_id, type: 'email-verification' }));
		await repository.create(buildToken({ user_id, type: 'forgot-password' }));
		await repository.create(buildToken({ user_id: new ObjectId().toString() }));

		expect(await repository.findByUserId(user_id)).toHaveLength(2);
	});

	it('deleteByUserId removes only that user tokens and returns the exact count', async () => {
		const user_id = new ObjectId().toString();
		const otherUser = new ObjectId().toString();
		await repository.create(buildToken({ user_id, type: 'email-verification' }));
		await repository.create(buildToken({ user_id, type: 'forgot-password' }));
		await repository.create(buildToken({ user_id: otherUser }));

		expect(await repository.deleteByUserId(user_id)).toBe(2);
		expect(await repository.deleteByUserId(user_id)).toBe(0);
		expect(await repository.findByUserId(otherUser)).toHaveLength(1);
	});

	it('throws NotFoundError on update/delete of a missing id', async () => {
		await expect(repository.update({ id: new ObjectId().toString(), token_hash: 'x' })).rejects.toBeInstanceOf(
			NotFoundError,
		);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
	});

	it('translates a duplicate token create to a domain BadRequestError', async () => {
		// create wraps the 11000 violation on the token unique index and translates it
		// to a domain BadRequestError via the shared mapDuplicateKeyError.
		const token_hash = new ObjectId().toString();
		await repository.create(buildToken({ token_hash }));

		const duplicate = repository.create(buildToken({ token_hash }));
		await expect(duplicate).rejects.toBeInstanceOf(BadRequestError);
	});

	it('translates a duplicate (user_id, type) create to a domain BadRequestError', async () => {
		// The compound unique index violation is translated too.
		const user_id = new ObjectId().toString();
		await repository.create(buildToken({ user_id, type: 'forgot-password' }));

		const duplicate = repository.create(buildToken({ user_id, type: 'forgot-password' }));
		await expect(duplicate).rejects.toBeInstanceOf(BadRequestError);
	});

	it('resolves a concurrent duplicate-token create race to one persisted record and one rejection', async () => {
		const token_hash = new ObjectId().toString();

		const results = await Promise.allSettled([
			repository.create(buildToken({ token_hash })),
			repository.create(buildToken({ token_hash })),
		]);

		const fulfilled = results.filter((result) => result.status === 'fulfilled');
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestError);

		expect(await TokenModel.countDocuments({ token_hash })).toBe(1);
	});

	it('resolves a concurrent duplicate (user_id, type) create race to one persisted record and one rejection', async () => {
		const user_id = new ObjectId().toString();

		const results = await Promise.allSettled([
			repository.create(buildToken({ user_id, type: 'forgot-password' })),
			repository.create(buildToken({ user_id, type: 'forgot-password' })),
		]);

		const fulfilled = results.filter((result) => result.status === 'fulfilled');
		const rejected = results.filter((result) => result.status === 'rejected');
		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestError);

		expect(await TokenModel.countDocuments({ user_id, type: 'forgot-password' })).toBe(1);
	});
});
