import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { ForbiddenError } from '@/shared/error/error.lib';
import { withActor } from '@/core/drinks/factories/authorship.factories';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { BadRequestError, NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUnitService } from './UpdateUnit.service';

let repository: UnitsRepositoryInMemory;
let service: UpdateUnitService;

describe('Update Unit', () => {
	beforeEach(() => {
		repository = new UnitsRepositoryInMemory();
		service = new UpdateUnitService(repository);
	});
	it('updates all unit fields and preserves false', async () => {
		const created = await repository.create(createUnitFactory());
		const update = createUnitFactory({
			translations: { en: { name: 'gram', namePlural: 'grams' }, pt: { name: 'grama', namePlural: 'gramas' } },
			symbol: 'g',
			spaceBeforeSymbol: false,
			allowDecimal: false,
			kind: 'mass',
		});
		await service.execute(withActor({ id: created.id, ...update }));
		expect(await repository.findById(created.id)).toMatchObject(update);
	});
	it('updates with optional fields omitted without manufacturing them', async () => {
		const created = await repository.create(createUnitFactory());
		const update = createUnitFactory({ kind: 'count' });
		await service.execute(withActor({ id: created.id, ...update }));
		const found = await repository.findById(created.id);
		expect(found).not.toHaveProperty('symbol');
		expect(found).not.toHaveProperty('spaceBeforeSymbol');
	});
	it('keeps the current symbol when symbol is omitted', async () => {
		const created = await repository.create(createUnitFactory({ symbol: 'ml' }));
		await service.execute(withActor({ id: created.id, ...createUnitFactory() }));

		expect((await repository.findById(created.id))?.symbol).toBe('ml');
	});

	it('removes the symbol when symbol is null', async () => {
		const created = await repository.create(createUnitFactory({ symbol: 'ml' }));
		await service.execute(withActor({ id: created.id, ...createUnitFactory(), symbol: null }));

		expect(await repository.findById(created.id)).not.toHaveProperty('symbol');
	});

	describe('written with the ingredient name', () => {
		const createEach = () =>
			repository.create(createUnitFactory({ kind: 'count', allowDecimal: false, useIngredientName: true }));

		it('turns the flag on and off', async () => {
			const created = await repository.create(createUnitFactory({ kind: 'count' }));
			await service.execute(
				withActor({ id: created.id, ...createUnitFactory({ kind: 'count', useIngredientName: true }) }),
			);
			expect((await repository.findById(created.id))?.useIngredientName).toBe(true);
			await service.execute(
				withActor({
					id: created.id,
					...createUnitFactory({ kind: 'count', useIngredientName: false }),
				}),
			);
			expect((await repository.findById(created.id))?.useIngredientName).toBe(false);
		});

		it('keeps the flag when it is omitted', async () => {
			const created = await createEach();
			await service.execute(withActor({ id: created.id, ...createUnitFactory({ kind: 'count' }) }));
			expect((await repository.findById(created.id))?.useIngredientName).toBe(true);
		});

		it('rejects turning it on for a unit that has a symbol the update keeps', async () => {
			const created = await repository.create(createUnitFactory({ kind: 'count', symbol: 'u' }));
			await expect(
				service.execute(
					withActor({ id: created.id, ...createUnitFactory({ kind: 'count', useIngredientName: true }) }),
				),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(await repository.findById(created.id)).not.toHaveProperty('useIngredientName');
		});

		it('accepts turning it on when the update removes the symbol', async () => {
			const created = await repository.create(createUnitFactory({ kind: 'count', symbol: 'u' }));
			await service.execute(
				withActor({
					id: created.id,
					...createUnitFactory({ kind: 'count', useIngredientName: true }),
					symbol: null,
				}),
			);
			expect((await repository.findById(created.id))?.useIngredientName).toBe(true);
		});

		it('rejects giving a symbol to a unit that stays written with the ingredient name', async () => {
			const created = await createEach();
			await expect(
				service.execute(withActor({ id: created.id, ...createUnitFactory({ kind: 'count' }), symbol: 'u' })),
			).rejects.toBeInstanceOf(BadRequestError);
			expect(await repository.findById(created.id)).not.toHaveProperty('symbol');
		});

		it('rejects changing the kind of a unit that stays written with the ingredient name', async () => {
			const created = await createEach();
			await expect(
				service.execute(withActor({ id: created.id, ...createUnitFactory({ kind: 'volume' }) })),
			).rejects.toBeInstanceOf(BadRequestError);
			expect((await repository.findById(created.id))?.kind).toBe('count');
		});
	});

	it('rejects a nonexistent unit', async () => {
		await expect(
			service.execute(withActor({ id: new ObjectId().toString(), ...createUnitFactory() })),
		).rejects.toBeInstanceOf(NotFoundError);
	});
	it.each([
		['English', { en: { name: 'gram' }, pt: { name: 'unidade portuguesa exclusiva' } }],
		['Portuguese', { en: { name: 'unique english unit' }, pt: { name: 'grama' } }],
	] as const)('rejects another unit name duplicated in %s only', async (_, translations) => {
		const first = await repository.create(createUnitFactory());
		await repository.create(
			createUnitFactory({
				translations: { en: { name: 'gram' }, pt: { name: 'grama' } },
				kind: 'mass',
			}),
		);
		const update = createUnitFactory({ translations, kind: 'mass' });
		await expect(service.execute(withActor({ id: first.id, ...update }))).rejects.toBeInstanceOf(ConflictError);
	});

	describe('who changes it', () => {
		const partner = { id: '66b0000000000000000000b2', role: 'partner' } as const;

		it('records the editor and keeps the creator, even when someone else updates', async () => {
			const created = await repository.create(createUnitFactory());

			await service.execute(
				withActor({ id: created.id, ...createUnitFactory() }, { id: 'admin-id', role: 'admin' }),
			);

			expect(await repository.findById(created.id)).toMatchObject({
				createdBy: created.createdBy,
				updatedBy: 'admin-id',
			});
		});

		it('does not let a partner update a unit created by someone else', async () => {
			const created = await repository.create(createUnitFactory());

			await expect(
				service.execute(withActor({ id: created.id, ...createUnitFactory() }, partner)),
			).rejects.toBeInstanceOf(ForbiddenError);
		});

		it('lets a partner update a unit they created', async () => {
			const created = await repository.create(createUnitFactory({ createdBy: partner.id }));

			await service.execute(withActor({ id: created.id, ...createUnitFactory() }, partner));

			expect(await repository.findById(created.id)).toMatchObject({
				createdBy: partner.id,
				updatedBy: partner.id,
			});
		});
	});
});
