import { Category } from '@/modules/drinks/entities/category.entity';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/modules/drinks/dtos/category.dtos';

export interface ICategoriesRepository {
	create(data: CreateCategory): Promise<Category>;
	update(data: UpdateCategory): Promise<Category>;
	delete(id: string): Promise<Category>;
	findByName(data: FindCategoryByName): Promise<Category | null>;
	findById(id: string): Promise<Category | null>;
	findAll(): Promise<Category[]>;
}
