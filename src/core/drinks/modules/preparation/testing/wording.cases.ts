import { PreparationAction } from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationDrink } from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { GarnishStyle } from '@/core/drinks/modules/preparation/types/technique.types';
import { drink, exact, garnishLine, garnishRef, ingredients as i, line, ml, unit, units } from './preparation.fixtures';

export type WordingCase = { title: string; drink: PreparationDrink; plan: PreparationPlan };

const ounce = unit('oz', ['ounce', 'ounces'], ['onça', 'onças'], 'feminine', 'volume');

/** A drink built in a rocks glass, which keeps the cases below short. */
const built = (
	actions: PreparationAction[],
	recipe: PreparationDrink,
): WordingCase['plan'] & { recipe: PreparationDrink } => ({
	mixingVessel: 'serving_glass',
	servingGlass: 'rocks',
	actions,
	recipe,
});

const withRecipe = (title: string, actions: PreparationAction[], recipe: PreparationDrink): WordingCase => {
	const { recipe: _recipe, ...plan } = built(actions, recipe);
	return { title, drink: recipe, plan };
};

const twistRecipe = drink([line(i.whisky, exact(60))], [garnishLine(i.orange, exact(1, units.twist))]);
const garnishStyles: Array<GarnishStyle | undefined> = [
	undefined,
	'express',
	'express_and_discard',
	'flame',
	'flame_and_discard',
	'skewer',
	'rim_perch',
	'float',
	'sprinkle',
];
const garnishCases = garnishStyles.map((style) =>
	withRecipe(
		`garnish style ${style ?? 'default'}`,
		[
			{ type: 'add', target: 'mixing', items: [ml(i.whisky)] },
			{ type: 'garnish', items: [garnishRef(i.orange, units.twist, true)], ...(style && { style }) },
		],
		twistRecipe,
	),
);

const shakerRecipe = drink([line(i.gin, exact(60))]);
const shakerPlan = (...rest: PreparationAction[]): PreparationPlan => ({
	mixingVessel: 'shaker',
	servingGlass: 'coupe',
	actions: [
		{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
		{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
		...rest,
	],
});
const strainCases: WordingCase[] = (['single', 'double', 'fine', 'none'] as const).flatMap((kind) => [
	{ title: `strain ${kind}`, drink: shakerRecipe, plan: shakerPlan({ type: 'shake' }, { type: 'strain', kind }) },
	{
		title: `strain ${kind} over ice`,
		drink: shakerRecipe,
		plan: {
			...shakerPlan(),
			actions: [
				{ type: 'add_ice', target: 'serving', kind: 'cubes' },
				...shakerPlan({ type: 'shake' }, { type: 'strain', kind, overIce: true }).actions,
			],
		},
	},
]);

const intensityCases: WordingCase[] = (['gentle', 'normal', 'vigorous'] as const).flatMap((intensity) => [
	{
		title: `shake ${intensity}`,
		drink: shakerRecipe,
		plan: shakerPlan({ type: 'shake', intensity }, { type: 'strain', kind: 'single' }),
	},
	{
		title: `muddle ${intensity}`,
		drink: drink([line(i.mint, exact(8, units.leaf)), line(i.gin)]),
		plan: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [{ list: 'ingredients', ingredientId: 'mint', unitId: 'leaf' }],
				},
				{ type: 'muddle', intensity },
				{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
				{ type: 'strain', kind: 'single' },
			],
		},
	},
]);

const durationCases: WordingCase[] = [
	{
		title: 'shake for one second',
		drink: shakerRecipe,
		plan: shakerPlan({ type: 'shake', seconds: 1 }, { type: 'strain', kind: 'single' }),
	},
	{
		title: 'shake for several seconds',
		drink: shakerRecipe,
		plan: shakerPlan({ type: 'shake', seconds: 15 }, { type: 'strain', kind: 'single' }),
	},
	withRecipe(
		'stir for one revolution',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
			{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
			{ type: 'stir', revolutions: 1 },
		],
		shakerRecipe,
	),
	withRecipe(
		'stir for several seconds, gently',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
			{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
			{ type: 'stir', seconds: 20, intensity: 'gentle' },
		],
		shakerRecipe,
	),
];

const glassCases: WordingCase[] = [
	{ title: 'chill the glass', mode: 'chill' as const },
	{ title: 'warm the glass', mode: 'warm' as const },
].map(({ title, mode }) =>
	withRecipe(
		title,
		[
			{ type: 'prepare_glass', mode },
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
		],
		shakerRecipe,
	),
);
const saltRecipe = drink([line(i.gin, exact(60)), line(i.absinthe, exact(5))], [garnishLine(i.salt)]);
glassCases.push(
	withRecipe(
		'rinse the glass',
		[
			{ type: 'prepare_glass', mode: 'rinse', item: ml(i.absinthe) },
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
		],
		drink([line(i.gin, exact(60)), line(i.absinthe, exact(5))]),
	),
	withRecipe(
		'rim the whole glass',
		[
			{ type: 'prepare_glass', mode: 'rim', item: garnishRef(i.salt) },
			{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.absinthe)] },
		],
		saltRecipe,
	),
	withRecipe(
		'rim half of the glass',
		[
			{ type: 'prepare_glass', mode: 'rim', item: garnishRef(i.salt), coverage: 'half' },
			{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.absinthe)] },
		],
		saltRecipe,
	),
);

const iceCases: WordingCase[] = (['cubes', 'crushed', 'large_cube', 'sphere'] as const).map((kind) =>
	withRecipe(
		`ice ${kind}`,
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
			{ type: 'add_ice', target: 'mixing', kind },
		],
		shakerRecipe,
	),
);

const mergeRecipe = drink(
	[line(i.gin, exact(60)), line(i.syrup, exact(10)), line(i.limeJuice, exact(20))],
	[garnishLine(i.mint, exact(1, units.sprig)), garnishLine(i.lime, exact(1, units.wedge))],
);
const itemCases: WordingCase[] = [
	withRecipe(
		'consecutive adds are written as one sentence',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
			{ type: 'add', target: 'mixing', items: [ml(i.syrup)] },
			{ type: 'add', target: 'mixing', items: [ml(i.limeJuice)] },
		],
		drink([line(i.gin, exact(60)), line(i.syrup, exact(10)), line(i.limeJuice, exact(20))]),
	),
	withRecipe(
		'consecutive garnishes of the same style are written as one sentence',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.syrup), ml(i.limeJuice)] },
			{ type: 'garnish', items: [garnishRef(i.mint, units.sprig, true)] },
			{ type: 'garnish', items: [garnishRef(i.lime, units.wedge, true)] },
		],
		mergeRecipe,
	),
	withRecipe(
		'garnishes of different styles stay apart',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.syrup), ml(i.limeJuice)] },
			{ type: 'garnish', items: [garnishRef(i.mint, units.sprig, true)], style: 'float' },
			{ type: 'garnish', items: [garnishRef(i.lime, units.wedge, true)], style: 'skewer' },
		],
		mergeRecipe,
	),
	withRecipe(
		'a unit is named only when asked, and takes the plural of the quantity',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.syrup), ml(i.limeJuice)] },
			{ type: 'garnish', items: [garnishRef(i.lime, units.wedge, true), garnishRef(i.mint, units.sprig)] },
		],
		drink(
			[line(i.gin, exact(60)), line(i.syrup, exact(10)), line(i.limeJuice, exact(20))],
			[garnishLine(i.lime, exact(2, units.wedge)), garnishLine(i.mint, exact(1, units.sprig))],
		),
	),
	withRecipe(
		'the english article is "an" before a vowel',
		[
			{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
			{ type: 'garnish', items: [garnishRef(i.orange, ounce, true)] },
		],
		drink([line(i.gin, exact(60))], [garnishLine(i.orange, exact(1, ounce))]),
	),
];

export const wordingCases: WordingCase[] = [
	...garnishCases,
	...strainCases,
	...intensityCases,
	...durationCases,
	...glassCases,
	...iceCases,
	...itemCases,
];
