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
    async update(data: Ingredient): Promise<Ingredient> {
        const ingredient = await this.prismaClient.ingredient.update({
            where: { id: data.id },
            data: {
                name: data.name,
                category: data.category,
                unity: data.unity,
                colorTheme: data.colorTheme,
                isAlcoholic: data.isAlcoholic
            }
        })

        return ingredient;
    }
    
    async delete(id: string): Promise<Ingredient> {
        const ingredient = await this.prismaClient.ingredient.delete({
            where: { id }
        })

        return ingredient;
    }


    async findByName(name: string): Promise<Ingredient> {
        const result = await this.prismaClient.ingredient.findUnique({where: { name }})
        return result
       
    }

    async findById(id: string): Promise<Ingredient> {
        const result = await this.prismaClient.ingredient.findUnique({where: { id }})
        return result
       
    }

    async findAll(): Promise<Ingredient[]> {
        const results = await this.prismaClient.ingredient.findMany()
        return results
    }
    async findByIdList(ids: string[]): Promise<Ingredient[]>{
        const results = await this.prismaClient.ingredient.findMany({where: {
            id: { in: ids }
        }});
        return results
    }

}

export { IngredientsRepository };