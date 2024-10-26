import { ObjectId } from 'mongodb';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { logger } from '@/shared/logger';
import { ingredientsMap } from './ingredients';

const drinks = [
	{
		_id: new ObjectId(),
		translations: {
			en: {
				name: 'Mojito',
				method: 'In a glass, muddle the mint leaves and lime juice together. Add the rich simple syrup and rum, then fill the glass with ice. Top with sparkling water and stir gently. Garnish with a mint sprig and a lime wedge.',
			},
			pt: {
				name: 'Mojito',
				method: 'Em um copo, macere as folhas de hortelã com o suco de limão. Adicione o xarope simples rico e a cachaça, depois encha o copo com gelo. Complete com água com gás e misture suavemente. Decore com um raminho de hortelã e uma fatia de limão.',
			},
		},
		ingredients: [
			{
				quantity: 60,
				ingredient: ingredientsMap.get('silver rum')!,
			},
			{
				quantity: 30,
				ingredient: ingredientsMap.get('lime juice')!,
			},
			{
				quantity: 30,
				ingredient: ingredientsMap.get('rich simple syrup')!,
			},
			{
				quantity: 8,
				ingredient: ingredientsMap.get('mint')!,
			},
			{
				quantity: 30,
				ingredient: ingredientsMap.get('sparkling water')!,
			},
		],
		cover: undefined,
		thumbnail: undefined,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: {
				name: 'Piña colada',
				method: 'Blend the rum, coconut cream, and pineapple juice with ice until smooth. Pour into a chilled glass and garnish with a pineapple slice and a cherry.',
			},
			pt: {
				name: 'Piña colada',
				method: 'Bata o rum, o creme de coco e o suco de abacaxi com gelo até ficar homogêneo. Despeje em um copo gelado e decore com uma fatia de abacaxi e uma cereja.',
			},
		},
		ingredients: [
			{
				quantity: 60,
				ingredient: ingredientsMap.get('silver rum')!,
			},
			{
				quantity: 30,
				ingredient: ingredientsMap.get('coconut liqueur')!,
			},
			{
				quantity: 90,
				ingredient: ingredientsMap.get('pineapple juice')!,
			},
		],
		cover: undefined,
		thumbnail: undefined,
		created_at: new Date(),
		updated_at: new Date(),
	},
	{
		_id: new ObjectId(),
		translations: {
			en: {
				name: 'Sex on the Beach',
				method: 'In a shaker, combine the vodka, peach liqueur, orange juice and ice. Shake well and strain into a glass filled with ice. Add the grenadine and garnish with an orange slice.',
			},
			pt: {
				name: 'Sex on the Beach',
				method: 'Em uma coqueteleira, misture a vodka, o licor de pêssego, o suco de laranja e gelo. Agite bem e coe em um copo cheio de gelo. adicione o grenadine e decore com uma fatia de laranja.',
			},
		},
		ingredients: [
			{
				quantity: 60,
				ingredient: ingredientsMap.get('vodka')!,
			},
			{
				quantity: 30,
				ingredient: ingredientsMap.get('peach liqueur')!,
			},
			{
				quantity: 90,
				ingredient: ingredientsMap.get('orange juice')!,
			},
			{
				quantity: 10,
				ingredient: ingredientsMap.get('grenadine')!,
			},
		],
		cover: undefined,
		thumbnail: undefined,
		created_at: new Date(),
		updated_at: new Date(),
	},
] as const satisfies readonly Drink[];

type DrinkEnName = (typeof drinks)[number]['translations']['en']['name'];

export const drinksMap = new Map<DrinkEnName, Drink>(
	drinks.map<[DrinkEnName, Drink]>((drink) => [drink.translations.en.name, drink]),
);

export async function insertDrinks() {
	try {
		await DrinkModel.insertMany(drinks);
		logger.info('Drinks inserted successfully');
	} catch (error) {
		logger.error('Error inserting Drinks:', error);
		throw error;
	}
}
