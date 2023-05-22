import { Prisma } from '@prisma/client'

type Ingredient = Prisma.IngredientCreateInput

interface IIngredientsRepository {
    create(data: Ingredient): Promise<Ingredient>;
    update(data: Ingredient): Promise<Ingredient>;
    delete(id: string): Promise<Ingredient>;
    findByName(name: string): Promise<Ingredient>;
    findById(id: string): Promise<Ingredient>;
    findAll(): Promise<Ingredient[]>;
    findByIdList(ids: string[]): Promise<Ingredient[]>;
}

export { IIngredientsRepository };