import { z } from 'zod/v4';
import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { Translations } from '@/core/drinks/types/translations';
import { FieldError } from '@/shared/error/error.dtos';
import { generateMethodSchema } from './generateMethod.schema';

export type GenerateMethodReqBody = z.infer<typeof generateMethodSchema>;

export type GenerateMethodDTO = {
	ingredients: DrinkIngredientInput[];
	/** Defaults to no garnishes when omitted. */
	garnishes?: DrinkGarnishInput[];
	preparation: PreparationPlan;
};

export type GenerateMethodResult = {
	/** The whole method in each language. */
	method: Translations<string>;
	/** The same method, one sentence per entry. */
	sentences: Translations<string[]>;
	/** Unusual but valid choices in the plan; they do not stop the method from being written. */
	warnings: FieldError[];
};
