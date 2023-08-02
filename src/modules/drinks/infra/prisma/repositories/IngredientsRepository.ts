import { ICreateIngredient, IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/infra/prisma';

class IngredientsRepository implements IIngredientsRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create(data: ICreateIngredient): Promise<Ingredient> {
		const ingredient = await this.prismaClient.ingredient.create({ data });
		return ingredient;
	}
	async update({
		id,
		name,
		categoryId,
		unitySingular,
		unityPlural,
		isAlcoholic
	}: IUpdateIngredient): Promise<Ingredient> {
		const ingredient = await this.prismaClient.ingredient.update({
			where: { id },
			data: {
				name,
				categoryId,
				unitySingular,
				unityPlural,
				isAlcoholic
			}
		});
		return ingredient;
	}

	async delete(id: string): Promise<Ingredient> {
		const ingredient = await this.prismaClient.ingredient.delete({
			where: { id }
		});
		return ingredient;
	}

	async findByName(name: string): Promise<Ingredient> {
		const result = await this.prismaClient.ingredient.findUnique({ where: { name }, include: { category: true } });
		return result;
	}

	async findById(id: string): Promise<Ingredient> {
		const result = await this.prismaClient.ingredient.findUnique({ where: { id }, include: { category: true } });
		return result;
	}

	async findAll(): Promise<Ingredient[]> {
		const results = await this.prismaClient.ingredient.findMany({ include: { category: true } });
		return results;
	}
	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const results = await this.prismaClient.ingredient.findMany({
			where: {
				id: { in: ids }
			},
			include: { category: true }
		});
		return results;
	}
}

export { IngredientsRepository };
