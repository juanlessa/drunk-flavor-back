import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { TokensRepositoryInMemory } from './Tokens.repository';
import { CreateToken } from '../../dtos/token.dtos';
import { NotFoundError } from '@/shared/error/error.lib';

const buildToken = (overrides?: Partial<CreateToken>): CreateToken => ({
	token: overrides?.token ?? new ObjectId().toString(),
	user_id: overrides?.user_id ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expires_at: overrides?.expires_at ?? new Date(Date.now() + 60 * 60 * 1000),
});

let repository: TokensRepositoryInMemory;

describe('TokensRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new TokensRepositoryInMemory();
	});

	it('persists all fields and assigns _id and timestamps on create', async () => {
		const expires_at = new Date('2030-01-01T00:00:00.000Z');
		const data = buildToken({ type: 'forgot-password', expires_at });

		const created = await repository.create(data);

		expect(created._id).toBeInstanceOf(ObjectId);
		expect(created.token).toBe(data.token);
		expect(created.user_id).toBe(data.user_id);
		expect(created.type).toBe('forgot-password');
		expect(created.expires_at).toBe(expires_at);
		expect(created.created_at).toBeInstanceOf(Date);
		expect(created.updated_at).toBeInstanceOf(Date);
	});

	describe('findByUserIdAndType', () => {
		it('returns the record when both user_id and type match', async () => {
			const data = buildToken();
			await repository.create(data);

			const found = await repository.findByUserIdAndType({ user_id: data.user_id, type: data.type });
			expect(found?.token).toBe(data.token);
		});

		it('returns null when the user_id matches but the type does not', async () => {
			const data = buildToken({ type: 'email-verification' });
			await repository.create(data);

			expect(await repository.findByUserIdAndType({ user_id: data.user_id, type: 'forgot-password' })).toBeNull();
		});

		it('returns null when the type matches but the user_id does not', async () => {
			const data = buildToken({ type: 'email-verification' });
			await repository.create(data);

			expect(
				await repository.findByUserIdAndType({
					user_id: new ObjectId().toString(),
					type: 'email-verification',
				}),
			).toBeNull();
		});
	});

	describe('findByToken and findByUserId', () => {
		it('findByToken returns a match and null otherwise', async () => {
			const data = buildToken();
			await repository.create(data);

			expect((await repository.findByToken(data.token))?.token).toBe(data.token);
			expect(await repository.findByToken(new ObjectId().toString())).toBeNull();
		});

		it('findByUserId returns only the tokens of the given user', async () => {
			const user_id = new ObjectId().toString();
			await repository.create(buildToken({ user_id, type: 'email-verification' }));
			await repository.create(buildToken({ user_id, type: 'forgot-password' }));
			await repository.create(buildToken({ user_id: new ObjectId().toString() }));

			expect(await repository.findByUserId(user_id)).toHaveLength(2);
		});
	});

	describe('deleteByUserId', () => {
		it('removes only the matching user tokens and returns the removed count', async () => {
			const user_id = new ObjectId().toString();
			const otherUser = new ObjectId().toString();
			await repository.create(buildToken({ user_id, type: 'email-verification' }));
			await repository.create(buildToken({ user_id, type: 'forgot-password' }));
			await repository.create(buildToken({ user_id: otherUser }));

			expect(await repository.deleteByUserId(user_id)).toBe(2);
			expect(await repository.findByUserId(user_id)).toHaveLength(0);
			expect(await repository.findByUserId(otherUser)).toHaveLength(1);
		});

		it('returns 0 when no token matches', async () => {
			expect(await repository.deleteByUserId(new ObjectId().toString())).toBe(0);
		});
	});

	describe('update', () => {
		it('deep-merges data, refreshes updated_at and preserves untouched fields', async () => {
			const created = await repository.create(buildToken({ type: 'email-verification' }));
			const newToken = new ObjectId().toString();

			const updated = await repository.update({ id: created._id.toString(), token: newToken });

			expect(updated.token).toBe(newToken);
			expect(updated.type).toBe('email-verification');
			expect(updated.user_id).toBe(created.user_id);
			expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(created.updated_at.getTime());
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.update({ id: new ObjectId().toString(), token: 'x' })).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});

	describe('delete', () => {
		it('returns the removed record', async () => {
			const created = await repository.create(buildToken());

			const deleted = await repository.delete(created._id.toString());
			expect(deleted._id.toString()).toBe(created._id.toString());
			expect(await repository.findById(created._id.toString())).toBeNull();
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);
		});
	});
});
