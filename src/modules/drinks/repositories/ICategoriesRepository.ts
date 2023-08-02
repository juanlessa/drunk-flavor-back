import Category from '@modules/drinks/entities/Category';
import { ICreateCategory, IUpdateCategory } from '@modules/drinks/dtos/Categories';

interface ICategoriesRepository {
	create(data: ICreateCategory): Promise<Category>;
	update(data: IUpdateCategory): Promise<Category>;
	delete(id: string): Promise<Category>;
	findByName(name: string): Promise<Category>;
	findById(id: string): Promise<Category>;
	findAll(): Promise<Category[]>;
}

export { ICategoriesRepository };
