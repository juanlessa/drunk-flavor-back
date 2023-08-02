import { ICreateCategory, IUpdateCategory } from '@modules/drinks/dtos/Categories';
import Category from '@modules/drinks/entities/Category';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/infra/prisma';

class CategoriesRepository implements ICategoriesRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create(data: ICreateCategory): Promise<Category> {
		const category = await this.prismaClient.category.create({ data });
		return category;
	}
	async update({ id, name }: IUpdateCategory): Promise<Category> {
		const category = await this.prismaClient.category.update({
			where: { id },
			data: {
				name
			}
		});
		return category;
	}

	async delete(id: string): Promise<Category> {
		const category = await this.prismaClient.category.delete({
			where: { id }
		});
		return category;
	}

	async findByName(name: string): Promise<Category> {
		const result = await this.prismaClient.category.findUnique({ where: { name } });
		return result;
	}

	async findById(id: string): Promise<Category> {
		const result = await this.prismaClient.category.findUnique({ where: { id } });
		return result;
	}

	async findAll(): Promise<Category[]> {
		const results = await this.prismaClient.category.findMany();
		return results;
	}
}

export { CategoriesRepository };
