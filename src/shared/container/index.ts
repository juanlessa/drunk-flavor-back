import { container } from 'tsyringe';
import '@shared/container/providers';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { IngredientsRepository } from '@modules/drinks/infra/prisma/repositories/IngredientsRepository';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { CategoriesRepository } from '@modules/drinks/infra/prisma/repositories/CategoriesRepository';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { DrinksRepository } from '@modules/drinks/infra/prisma/repositories/DrinksRepository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { UsersRepository } from '@modules/accounts/infra/prisma/repositories/UsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { UsersTokensRepository } from '@modules/accounts/infra/prisma/repositories/UsersTokensRepository';

container.registerSingleton<ICategoriesRepository>('CategoriesRepository', CategoriesRepository);

container.registerSingleton<IIngredientsRepository>('IngredientsRepository', IngredientsRepository);

container.registerSingleton<IDrinksRepository>('DrinksRepository', DrinksRepository);

container.registerSingleton<IUsersRepository>('UsersRepository', UsersRepository);

container.registerSingleton<IUsersTokensRepository>('UsersTokensRepository', UsersTokensRepository);
