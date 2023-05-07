import { Prisma } from '@prisma/client'

type Ingredient = Prisma.IngredientCreateInput

interface IIngredientsRepository {
    create(data: Ingredient): Promise<Ingredient>;
    findByName(name: string): Promise<Ingredient[]>;
    findAll(): Promise<Ingredient[]>;
}

export { IIngredientsRepository };