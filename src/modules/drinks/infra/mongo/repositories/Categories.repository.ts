import { ICreateCategory, IFindCategoryByName, IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { Category } from '@modules/drinks/infra/mongo/entities/category.model';
import { getNameCompareQuery } from '@modules/drinks/infra/mongo/utils/getNameCompareQuery';
import { NotFoundError } from '@shared/errors/error.lib';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';

class CategoriesRepository implements ICategoriesRepository {
	async create(data: ICreateCategory): Promise<ICategory> {
		return Category.create(data);
	}
	async update({ id, ...data }: IUpdateCategory): Promise<ICategory> {
		const category = await Category.findByIdAndUpdate<ICategory>(id, data, { new: true }).exec();
		if (!category) {
			throw new NotFoundError(CATEGORY_ERRORS.not_found, {
				path: 'Categories.repository',
				cause: 'Error on findByIdAndUpdate operation'
			});
		}
		return category;
	}

	async delete(id: string): Promise<ICategory> {
		const category = await Category.findByIdAndDelete<ICategory>(id).exec();
		if (!category) {
			throw new NotFoundError(CATEGORY_ERRORS.not_found, {
				path: 'Categories.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}
		return category;
	}

	async findByName(data: IFindCategoryByName): Promise<ICategory | null> {
		return Category.findOne<ICategory>({ $or: getNameCompareQuery(data) }).exec();
	}

	async findById(id: string): Promise<ICategory | null> {
		return Category.findById<ICategory>(id).exec();
	}

	async findAll(): Promise<ICategory[]> {
		return Category.find<ICategory>().exec();
	}
}

export { CategoriesRepository };
