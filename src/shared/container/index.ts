import { container } from 'tsyringe';
import '@shared/container/providers';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { IngredientsRepository } from '@modules/drinks/infra/mongo/repositories/Ingredients.repository';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { CategoriesRepository } from '@modules/drinks/infra/mongo/repositories/Categories.repository';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { DrinksRepository } from '@modules/drinks/infra/mongo/repositories/Drinks.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/UsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { UsersTokensRepository } from '@modules/accounts/infra/mongo/repositories/UsersTokensRepository';

container.registerSingleton<ICategoriesRepository>('CategoriesRepository', CategoriesRepository);

container.registerSingleton<IIngredientsRepository>('IngredientsRepository', IngredientsRepository);

container.registerSingleton<IDrinksRepository>('DrinksRepository', DrinksRepository);

container.registerSingleton<IUsersRepository>('UsersRepository', UsersRepository);

container.registerSingleton<IUsersTokensRepository>('UsersTokensRepository', UsersTokensRepository);
