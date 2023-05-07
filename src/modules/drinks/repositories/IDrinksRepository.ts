import { Prisma } from '@prisma/client'

type Drink = Prisma.DrinkCreateInput

interface IDrinksRepository {
    create(data: Drink): Promise<Drink>;
    findByName(name: string): Promise<Drink[]>;
    findAll(): Promise<Drink[]>;
}

export { IDrinksRepository };