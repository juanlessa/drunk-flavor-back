import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICreateCategory, IFindCategoryByName, IUpdateCategory } from '@modules/drinks/dtos/category.dtos';

interface ICategoriesRepository {
	create(data: ICreateCategory): Promise<ICategory>;
	update(data: IUpdateCategory): Promise<ICategory>;
	delete(id: string): Promise<ICategory>;
	findByName(data: IFindCategoryByName): Promise<ICategory>;
	findById(id: string): Promise<ICategory>;
	findAll(): Promise<ICategory[]>;
}

export { ICategoriesRepository };
