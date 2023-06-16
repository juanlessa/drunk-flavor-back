import { ICreateIngredient, IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/container/providers/prisma';

class IngredientsRepository implements IIngredientsRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create(data: ICreateIngredient): Promise<Ingredient> {
		const ingredient = await this.prismaClient.ingredient.create({ data });
		return ingredient;
	}
	async update({ id, name, category, unity, colorTheme, isAlcoholic }: IUpdateIngredient): Promise<Ingredient> {
		const ingredient = await this.prismaClient.ingredient.update({
			where: { id },
			data: {
				name,
				category,
				unity,
				colorTheme,
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
		const result = await this.prismaClient.ingredient.findUnique({ where: { name } });
		return result;
	}

	async findById(id: string): Promise<Ingredient> {
		const result = await this.prismaClient.ingredient.findUnique({ where: { id } });
		return result;
	}

	async findAll(): Promise<Ingredient[]> {
		const results = await this.prismaClient.ingredient.findMany();
		return results;
	}
	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		const results = await this.prismaClient.ingredient.findMany({
			where: {
				id: { in: ids }
			}
		});
		return results;
	}
}

export { IngredientsRepository };
