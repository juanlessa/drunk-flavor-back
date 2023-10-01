import { ICreateCategory, IFindCategoryByName, IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICategoriesRepository } from '@modules/drinks/repositories/categories.repository.interface';
import { Category } from '@modules/drinks/infra/mongo/entities/category.model';
import { getNameCompareQuery } from '@modules/drinks/infra/mongo/utils/getNameCompareQuery';

class CategoriesRepository implements ICategoriesRepository {
	async create(data: ICreateCategory): Promise<ICategory> {
		const category = new Category(data);
		await category.save();
		return category;
	}
	async update({ id, translations }: IUpdateCategory): Promise<ICategory> {
		return await Category.findByIdAndUpdate<ICategory>({ _id: id }, { translations }).exec();
	}

	async delete(id: string): Promise<ICategory> {
		return await Category.findOneAndDelete<ICategory>({ _id: id }).exec();
	}

	async findByName(data: IFindCategoryByName): Promise<ICategory> {
		return await Category.findOne<ICategory>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<ICategory> {
		return await Category.findById<ICategory>(id).exec();
	}

	async findAll(): Promise<ICategory[]> {
		return await Category.find<ICategory>().exec();
	}
}

export { CategoriesRepository };
