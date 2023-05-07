import { container } from "tsyringe";
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";
import { IngredientsRepository } from "@modules/drinks/infra/prisma/IngredientsRepository";
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import { DrinksRepository } from "@modules/drinks/infra/prisma/DrinksRepository";


container.registerSingleton<IIngredientsRepository>(
    "IngredientsRepository",
    IngredientsRepository
);

container.registerSingleton<IDrinksRepository>(
    "DrinksRepository",
    DrinksRepository
);
