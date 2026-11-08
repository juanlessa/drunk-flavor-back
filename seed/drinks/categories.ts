import { CreateCategoryDTO } from '@/core/drinks/useCases/categories/create/createCategory.dtos';
import { resolveCreateCategoryService } from '@/core/drinks/useCases/categories/create/createCategory.container';
import { Category } from '@/core/drinks/entities/category.entity';
import { logger } from '@/shared/providers/logger';

const categories = [
	{ translations: { en: { name: 'Cachaça' }, pt: { name: 'Cachaça' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Coffee' }, pt: { name: 'Café' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Foam' }, pt: { name: 'Espuma' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Fruit' }, pt: { name: 'Fruta' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Fruit peel' }, pt: { name: 'Casca de fruta' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Gin' }, pt: { name: 'Gin' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Herb' }, pt: { name: 'Erva' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Liqueur' }, pt: { name: 'Licor' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Mezcal' }, pt: { name: 'Mezcal' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Pulp' }, pt: { name: 'Polpa' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Rum' }, pt: { name: 'Rum' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Sake' }, pt: { name: 'Saquê' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Soft drink' }, pt: { name: 'Bebida gaseificada' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Spice' }, pt: { name: 'Especiaria' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } }, isAlcoholic: false },
	{ translations: { en: { name: 'Tequila' }, pt: { name: 'Tequila' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Vodka' }, pt: { name: 'Vodka' } }, isAlcoholic: true },
	{ translations: { en: { name: 'Whisky' }, pt: { name: 'Whisky' } }, isAlcoholic: true },
] as const satisfies readonly CreateCategoryDTO[];

type CategoryEnName = (typeof categories)[number]['translations']['en']['name'];

/** Created categories keyed by their English name, for ingredients.ts to reference. */
export const categoriesMap = new Map<CategoryEnName, Category>();

export async function insertCategories() {
	try {
		const service = resolveCreateCategoryService();
		for (const category of categories) {
			const created = await service.execute(category);
			categoriesMap.set(category.translations.en.name, created);
		}
		logger.info('Categories inserted successfully');
	} catch (error) {
		logger.error({ err: error }, 'Error inserting categories');
		throw error;
	}
}
