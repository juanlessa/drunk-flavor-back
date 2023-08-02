import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/infra/prisma';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import Drink from '@modules/drinks/entities/Drink';
import { ICreateDrink, IUpdateDrink } from '@modules/drinks/dtos/Drinks';

class DrinksRepository implements IDrinksRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create({ name, method, ingredients }: ICreateDrink): Promise<Drink> {
		const drink = await this.prismaClient.drink.create({
			data: {
				name,
				method,
				ingredients: {
					create: ingredients
				}
			},
			include: { ingredients: { include: { ingredient: true } } }
		});

		return drink;
	}
	async update({ id, name, method, cover, thumbnail, ingredients }: IUpdateDrink): Promise<Drink> {
		const drink = await this.prismaClient.drink.update({
			where: { id },
			data: {
				name,
				method,
				cover,
				thumbnail,
				ingredients: {
					delete: {},
					create: ingredients
				}
			}
		});
		return drink;
	}
	async delete(id: string): Promise<Drink> {
		const drink = await this.prismaClient.drink.delete({
			where: { id }
		});

		return drink;
	}

	async findByName(name: string): Promise<Drink> {
		const results = await this.prismaClient.drink.findUnique({ where: { name } });
		return results;
	}

	async findById(id: string): Promise<Drink> {
		const results = await this.prismaClient.drink.findUnique({ where: { id: id } });
		return results;
	}

	async findAll(): Promise<Drink[]> {
		const results = await this.prismaClient.drink.findMany();
		return results;
	}

	async findByNameWithIngredientsDetails(name: string): Promise<Drink> {
		const result = await this.prismaClient.drink.findUnique({
			where: { name },
			include: {
				ingredients: {
					select: {
						ingredient: { include: { category: true } },
						quantity: true,
						id: false,
						ingredientId: false,
						drinkId: false
					}
				}
			}
		});

		return result;
	}

	async findByIdWithIngredientsDetails(id: string): Promise<Drink> {
		const result = await this.prismaClient.drink.findUnique({
			where: { id },
			include: {
				ingredients: {
					select: {
						ingredient: { include: { category: true } },
						quantity: true,
						id: false,
						ingredientId: false,
						drinkId: false
					}
				}
			}
		});

		return result;
	}

	async findAllWithIngredientsDetails(): Promise<Drink[]> {
		const result = await this.prismaClient.drink.findMany({
			include: {
				ingredients: {
					select: {
						ingredient: { include: { category: true } },
						quantity: true,
						id: false,
						ingredientId: false,
						drinkId: false
					}
				}
			}
		});

		return result;
	}
}

export { DrinksRepository };
