import { resolveDrinkRecipe } from '@/core/drinks/helpers/drinkRecipe.helpers';
import { toPreparationFieldError } from '@/core/drinks/mappers/preparationIssue.mappers';
import { buildMethod } from '@/core/drinks/modules/preparation';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { FieldValidationError } from '@/shared/error/error.lib';
import { GenerateMethodCommand, GenerateMethodResult } from './generateMethod.dtos';

const path = 'GenerateMethod.service';

/**
 * Writes the preparation method of a drink in every language from its recipe lines and a preparation plan.
 * Nothing is saved: it answers what the method would be.
 */
export class GenerateMethodService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ ingredients, garnishes = [], preparation }: GenerateMethodCommand): Promise<GenerateMethodResult> {
		const recipe = await resolveDrinkRecipe(this.ingredientsRepository, { ingredients, garnishes }, path);

		const result = buildMethod(recipe, preparation);
		if (!result.ok) {
			throw new FieldValidationError(result.errors.map(toPreparationFieldError), { path });
		}

		return {
			method: result.method,
			sentences: result.sentences,
			warnings: result.warnings.map(toPreparationFieldError),
		};
	}
}
