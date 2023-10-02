import { container } from 'tsyringe';
import '@shared/container/providers';
import { IIngredientsRepository } from '@modules/drinks/repositories/ingredients.repository.interface';
import { IngredientsRepository } from '@modules/drinks/infra/mongo/repositories/ingredients.repository';
import { ICategoriesRepository } from '@modules/drinks/repositories/categories.repository.interface';
import { CategoriesRepository } from '@modules/drinks/infra/mongo/repositories/categories.repository';
import { IDrinksRepository } from '@modules/drinks/repositories/drinks.repository.interface';
import { DrinksRepository } from '@modules/drinks/infra/mongo/repositories/drinks.repository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { UsersRepository } from '@modules/accounts/infra/mongo/repositories/UsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { UsersTokensRepository } from '@modules/accounts/infra/mongo/repositories/UsersTokensRepository';

container.registerSingleton<ICategoriesRepository>('CategoriesRepository', CategoriesRepository);

container.registerSingleton<IIngredientsRepository>('IngredientsRepository', IngredientsRepository);

container.registerSingleton<IDrinksRepository>('DrinksRepository', DrinksRepository);

container.registerSingleton<IUsersRepository>('UsersRepository', UsersRepository);

container.registerSingleton<IUsersTokensRepository>('UsersTokensRepository', UsersTokensRepository);
