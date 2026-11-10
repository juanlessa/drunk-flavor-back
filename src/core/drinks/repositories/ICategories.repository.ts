import { Category } from '@/core/drinks/entities/category.entity';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { QueryParams } from '@/shared/types/query.types';

export interface ICategoriesRepository {
	create(data: CreateCategory): Promise<Category>;
	update(data: UpdateCategory): Promise<Category>;
	delete(id: string): Promise<Category>;
	findByName(data: FindCategoryByName): Promise<Category | null>;
	findById(id: string): Promise<Category | null>;
	findAll(query: QueryParams): Promise<Category[]>;
	/** Like `findAll`, with the records created by `userId` first and the others after, each group in the order of the query. */
	findAllOwnedFirst(query: QueryParams, userId: string): Promise<Category[]>;
	/** Removes the user as creator and last editor of the records, which stay as they are. Returns how many were touched. */
	clearCreatorByUser(userId: string): Promise<number>;
}
