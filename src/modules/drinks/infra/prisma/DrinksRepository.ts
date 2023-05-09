import { PrismaClient, Prisma } from '@prisma/client'
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import {IDrinkResponse, IDrink } from '@modules/drinks/dtos/DrinksDTO'

interface IDrinkAggregation {
    _id: {
         '$oid': string 
    },
    name: string,
    method: string,
    created_at: { 
        '$date': Date 
    },
    ingredients: { 
        ingredientId: {
            '$oid': string 
        }, 
        quantity: number, 
        ingredient: {
            _id:{
                '$oid': string 
           },
            name: string,
            unity: string,
            category: string,
            isAlcoholic: boolean,
            colorTheme: string,
             created_at: { 
                '$date': Date 
            },
        }
         
    }[]
}

class DrinksRepository implements IDrinksRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient =  new PrismaClient();
    }


    async create(data: IDrink): Promise<IDrink> {
        const drink = await this.prismaClient.drink.create({data})

        return drink;
    }

    async findByName(name: string): Promise<IDrink> {
        const results = await this.prismaClient.drink.findUnique({where: { name }})
        return results
    }
    async findById(id: string): Promise<IDrink> {
        const results = await this.prismaClient.drink.findUnique({where: { id }})
        return results
    }
    async findAll(): Promise<IDrink[]> {
        const results = await this.prismaClient.drink.findMany()
        return results
    }
    async findByNameWithIngredientsDetails(name: string): Promise<IDrinkResponse[]> {
        const results = await this.prismaClient.drink.aggregateRaw({pipeline: 
        [ 
            { $match : { name : name } },
            { $lookup: { from: 'ingredients', localField: 'ingredients.ingredientId', foreignField: '_id', as: 'ingredientDetail' } },
            { $addFields: { ingredients: { $map: {
                        input:"$ingredients",
                        as:'ingredient',
                        in: {
                            $mergeObjects: [
                                '$$ingredient',
                                { ingredient: { $arrayElemAt: [ 
                                    '$ingredientDetail',
                                    { $indexOfArray: [ '$ingredients', '$$ingredient']
                                }
                            ]
                        }
                    }]
                    }
                  }
                }
              }
            },
            {
              $unset:["ingredientDetail"]
            }]
        })
        
        return convertToDrinkResponse(results)
    }
    async findByIdWithIngredientsDetails(id: string): Promise<IDrinkResponse[]> {
        const results = await this.prismaClient.drink.aggregateRaw({pipeline: 
        [ 
            { $match : { "_id": { "$oid": id }, } }, 
            { $lookup: { from: 'ingredients', localField: 'ingredients.ingredientId', foreignField: '_id', as: 'ingredientDetail' } },
            { $addFields: { ingredients: { $map: {
                        input:"$ingredients",
                        as:'ingredient',
                        in: {
                            $mergeObjects: [
                                '$$ingredient',
                                { ingredient: { $arrayElemAt: [ 
                                    '$ingredientDetail',
                                    { $indexOfArray: [ '$ingredients', '$$ingredient']
                                }
                            ]
                        }
                    }]
                    }
                  }
                }
              }
            },
            {
              $unset:["ingredientDetail"]
            }]
        })
        
        return convertToDrinkResponse(results)
    }

    async findAllWithIngredientsDetails(): Promise<IDrinkResponse[]> {
        const results = await this.prismaClient.drink.aggregateRaw({pipeline: 
        [ 
            { $lookup: { from: 'ingredients', localField: 'ingredients.ingredientId', foreignField: '_id', as: 'ingredientDetail' } },
            { $addFields: { ingredients: { $map: {
                        input:"$ingredients",
                        as:'ingredient',
                        in: {
                            $mergeObjects: [
                                '$$ingredient',
                                { ingredient: { $arrayElemAt: [ 
                                    '$ingredientDetail',
                                    { $indexOfArray: [ '$ingredients', '$$ingredient']
                                }
                            ]
                        }
                    }]
                    }
                  }
                }
              }
            },
            {
              $unset:["ingredientDetail"]
            }]
        })
        
        return convertToDrinkResponse(results)
    }

}

const convertToDrinkResponse = (jsonObject:Prisma.JsonObject):IDrinkResponse[] =>{
    const drinksAggregationList = (jsonObject as Object).valueOf() as IDrinkAggregation[]
    const drinkResponse = drinksAggregationList.map((drinkAggregation)=>{
        return {
            id: drinkAggregation._id.$oid,
            name: drinkAggregation.name,
            method: drinkAggregation.method,
            ingredients: drinkAggregation.ingredients.map((ing)=>{
                return {
                    ingredientId: ing.ingredientId.$oid,
                    quantity: ing.quantity,
                    name: ing.ingredient.name,
                    unity: ing.ingredient.unity,
                    category: ing.ingredient.category,
                    isAlcoholic: ing.ingredient.isAlcoholic,
                    colorTheme: ing.ingredient.colorTheme,
                    created_at: ing.ingredient.created_at.$date
                }
            })
        }
    })

    return drinkResponse
}

export { DrinksRepository };