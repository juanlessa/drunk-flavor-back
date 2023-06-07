import { PrismaClient, Prisma } from '@prisma/client'
import { getPrismaClient } from '@shared/container/providers/prismaProvider'
import { IDrinksRepository } from "@modules/drinks/repositories/IDrinksRepository";
import {IDrinkResponse, IDrink } from '@modules/drinks/dtos/DrinksDTO'

interface IDrinkAggregation {
    _id: {
         '$oid': string 
    },
    name: string,
    method: string,
    cover: string,
    thumbnail: string,
    created_at: { 
        '$date': Date 
    },
    ingredients: { 
        ingredientId: {
            '$oid': string 
        }, 
        quantity: number, 
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
    }[]
}

class DrinksRepository implements IDrinksRepository {
    private prismaClient: PrismaClient;

    constructor() {
        this.prismaClient = getPrismaClient();
    }


    async create(data: IDrink): Promise<IDrink> {
        const drink = await this.prismaClient.drink.create({data})

        return drink;
    }
    async update(data: IDrink): Promise<IDrink> {
        const drink = await this.prismaClient.drink.update({
            where: { id: data.id },
            data: {
                name: data.name,
                method: data.method,
                ingredients: data.ingredients,
                cover: data.cover,
                thumbnail: data.thumbnail
            }
        })
        return drink;
    }
    async delete(id: string): Promise<IDrink> {
        const drink = await this.prismaClient.drink.delete({
            where: { id }
        })

        return drink;
    }



    async removeDeletedIngredient(deletedIngredientId: string): Promise<void> {
        // Find the drinks that contain the deletedIngredientId
        const drinks = await this.prismaClient.drink.findMany({
            where: {
                ingredients: {
                    some: {
                        ingredientId: deletedIngredientId
                    }
                }
            }
        }) 
        // Remove the deletedIngredientId from these drinks.
        drinks.forEach(async(d)=>{
            const ingredients = d.ingredients.filter((ing)=>{
                return ing.ingredientId !== deletedIngredientId
            })
            await this.prismaClient.drink.update({where: {id: d.id}, data: {ingredients}})
        })
    }

    async findByName(name: string): Promise<IDrink> {
        const results = await this.prismaClient.drink.findUnique({where: { name }})
        return results
    }
    async findById(id: string): Promise<IDrink> {        
        const results = await this.prismaClient.drink.findUnique({where: { id: id }})
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
                { $set: {
                    ingredients: {$map: {
                        input: "$ingredients",
                            in: {$mergeObjects: [
                                "$$this",
                                {$arrayElemAt: [
                                    "$ingredientDetail",
                                    {$indexOfArray: ["$ingredientDetail._id", "$$this.ingredientId"]}
                                ]}
                            ]}
                        }}
                    }
                },
                { $unset: "ingredientDetail"}
            ]   
        })
        
        return convertToDrinkResponse(results)
    }
    async findByIdWithIngredientsDetails(id: string): Promise<IDrinkResponse[]> {
        const results = await this.prismaClient.drink.aggregateRaw({pipeline: 
            [    
                { $match : { "_id": { "$oid": id }, } }, 
                { $lookup: { from: 'ingredients', localField: 'ingredients.ingredientId', foreignField: '_id', as: 'ingredientDetail' } },
                { $set: {
                    ingredients: {$map: {
                        input: "$ingredients",
                            in: {$mergeObjects: [
                                "$$this",
                                {$arrayElemAt: [
                                    "$ingredientDetail",
                                    {$indexOfArray: ["$ingredientDetail._id", "$$this.ingredientId"]}
                                ]}
                            ]}
                        }}
                    }
                },
                { $unset: "ingredientDetail"}
            ]   
        })
        return convertToDrinkResponse(results)
    }

    async findAllWithIngredientsDetails(): Promise<IDrinkResponse[]> {
        const results = await this.prismaClient.drink.aggregateRaw({pipeline: 
            [ 
                { $lookup: { from: 'ingredients', localField: 'ingredients.ingredientId', foreignField: '_id', as: 'ingredientDetail' } },
                { $set: {
                    ingredients: {$map: {
                        input: "$ingredients",
                        in: {$mergeObjects: [
                            "$$this",
                            {$arrayElemAt: [
                                "$ingredientDetail",
                                {$indexOfArray: ["$ingredientDetail._id", "$$this.ingredientId"]}
                            ]}
                        ]}
                    }}
                }},
                { $unset: "ingredientDetail"}
            ]   
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
            cover: drinkAggregation.cover,
            thumbnail: drinkAggregation.thumbnail,
            ingredients: drinkAggregation.ingredients.map((ing)=>{
                return {
                    ingredientId: ing.ingredientId.$oid,
                    quantity: ing.quantity,
                    name: ing.name,
                    unity: ing.unity,
                    category: ing.category,
                    isAlcoholic: ing.isAlcoholic,
                    colorTheme: ing.colorTheme,
                    created_at: ing.created_at.$date
                }
            })
        }
    })

    return drinkResponse
}

export { DrinksRepository };