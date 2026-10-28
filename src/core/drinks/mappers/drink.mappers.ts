import { Drink } from '@/core/drinks/entities/drink.entity';

export type DrinkView = Omit<Drink, 'ratingsSum'>;

export const toDrinkView = ({ ratingsSum: _ratingsSum, ...drink }: Drink): DrinkView => drink;
