import { PrismaClient, Prisma } from '@prisma/client'
import { IIngredientsRepository } from "@modules/drinks/repositories/IIngredientsRepository";

type Ingredient = Prisma.IngredientCreateInput

class IngredientsRepository implements IIngredientsRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient =  new PrismaClient();
    }


    async create(data: Ingredient): Promise<Ingredient> {
        const ingredient = await this.prismaClient.ingredient.create({data})

        return ingredient;
    }

    async findByName(name: string): Promise<Ingredient[]> {
        const results = await this.prismaClient.ingredient.findMany({where: { name }})
        return results
       
    }

    async findAll(): Promise<Ingredient[]> {
        const results = await this.prismaClient.ingredient.findMany()
        return results
    }

}

export { IngredientsRepository };