import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { TokensRepositoryInMemory } from './Tokens.repository';
import { CreateToken } from '../../dtos/token.dtos';
import { NotFoundError } from '@/shared/error/error.lib';

const buildToken = (overrides?: Partial<CreateToken>): CreateToken => ({
	tokenHash: overrides?.tokenHash ?? new ObjectId().toString(),
	userId: overrides?.userId ?? new ObjectId().toString(),
	type: overrides?.type ?? 'email-verification',
	expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000),
});

let repository: TokensRepositoryInMemory;

describe('TokensRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new TokensRepositoryInMemory();
	});

	it('persists all fields and assigns id and timestamps on create', async () => {
		const expiresAt = new Date('2030-01-01T00:00:00.000Z');
		const data = buildToken({ type: 'forgot-password', expiresAt });
		const created = await repository.create(data);

		expect(created.id).toEqual(expect.any(String));
		expect(created.tokenHash).toBe(data.tokenHash);
		expect(created.userId).toBe(data.userId);
		expect(created.type).toBe('forgot-password');
		expect(created.expiresAt).toBe(expiresAt);
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(created.updatedAt).toBeInstanceOf(Date);
	});

	describe('findByUserIdAndType', () => {
		it('returns the record when both userId and type match', async () => {
			const data = buildToken();
			await repository.create(data);
			const found = await repository.findByUserIdAndType({ userId: data.userId, type: data.type });
			expect(found?.tokenHash).toBe(data.tokenHash);
		});

		it('returns null when the userId matches but the type does not', async () => {
			const data = buildToken({ type: 'email-verification' });
			await repository.create(data);
			expect(await repository.findByUserIdAndType({ userId: data.userId, type: 'forgot-password' })).toBeNull();
		});

		it('returns null when the type matches but the userId does not', async () => {
			const data = buildToken({ type: 'email-verification' });
			await repository.create(data);
			expect(
				await repository.findByUserIdAndType({
					userId: new ObjectId().toString(),
					type: 'email-verification',
				}),
			).toBeNull();
		});
	});

	describe('findByTokenHash and findByUserId', () => {
		it('findByTokenHash returns a match and null otherwise', async () => {
			const data = buildToken();
			await repository.create(data);
			expect((await repository.findByTokenHash(data.tokenHash))?.tokenHash).toBe(data.tokenHash);
			expect(await repository.findByTokenHash(new ObjectId().toString())).toBeNull();
		});

		it('findByUserId returns only the tokens of the given user', async () => {
			const userId = new ObjectId().toString();
			await repository.create(buildToken({ userId, type: 'email-verification' }));
			await repository.create(buildToken({ userId, type: 'forgot-password' }));
			await repository.create(buildToken({ userId: new ObjectId().toString() }));
			expect(await repository.findByUserId(userId)).toHaveLength(2);
		});
	});

	describe('deleteByUserId', () => {
		it('removes only matching user tokens and returns the removed count', async () => {
			const userId = new ObjectId().toString();
			const otherUser = new ObjectId().toString();
			await repository.create(buildToken({ userId, type: 'email-verification' }));
			await repository.create(buildToken({ userId, type: 'forgot-password' }));
			await repository.create(buildToken({ userId: otherUser }));
			expect(await repository.deleteByUserId(userId)).toBe(2);
			expect(await repository.findByUserId(userId)).toHaveLength(0);
			expect(await repository.findByUserId(otherUser)).toHaveLength(1);
		});

		it('returns 0 when no token matches', async () => {
			expect(await repository.deleteByUserId(new ObjectId().toString())).toBe(0);
		});
	});

	describe('update', () => {
		it('deep-merges data, refreshes updatedAt and preserves untouched fields', async () => {
			const created = await repository.create(buildToken({ type: 'email-verification' }));
			const tokenHash = new ObjectId().toString();
			const updated = await repository.update({ id: created.id, tokenHash });
			expect(updated.tokenHash).toBe(tokenHash);
			expect(updated.type).toBe('email-verification');
			expect(updated.userId).toBe(created.userId);
			expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.update({ id: 'missing', tokenHash: 'x' })).rejects.toBeInstanceOf(NotFoundError);
		});
	});

	describe('delete', () => {
		it('returns the removed record', async () => {
			const created = await repository.create(buildToken());
			const deleted = await repository.delete(created.id);
			expect(deleted.id).toBe(created.id);
			expect(await repository.findById(created.id)).toBeNull();
		});

		it('throws NotFoundError when the id is missing', async () => {
			await expect(repository.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
		});
	});
});
