import { PrismaClient, Prisma } from '@prisma/client'
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";

type Drink = Prisma.DrinkCreateInput

class DrinksRepository implements IDrinksRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient =  new PrismaClient();
    }


    async create(data: Drink): Promise<Drink> {
        const drink = await this.prismaClient.drink.create({data})

        return drink;
    }

    async findByName(name: string): Promise<Drink[]> {
        const results = await this.prismaClient.drink.findMany({where: { name }})
        return results
    }

    async findAll(): Promise<Drink[]> {
        const results = await this.prismaClient.drink.findMany()
        return results
    }

}

export { DrinksRepository };