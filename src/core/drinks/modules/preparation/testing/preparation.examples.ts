import { PreparationDrink } from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { bare, drink, exact, garnishLine, garnishRef, ingredients as i, line, ml, units } from './preparation.fixtures';

export type PreparationExample = { name: string; drink: PreparationDrink; plan: PreparationPlan };

/** Complete recipes covering the techniques a bar uses. Each one is checked against its written method. */
export const preparationExamples: PreparationExample[] = [
	{
		name: 'daiquiri (shaken, strained into a coupe)',
		drink: drink(
			[line(i.rum, exact(60)), line(i.limeJuice, exact(25)), line(i.syrup, exact(15))],
			[garnishLine(i.lime, exact(1, units.wedge))],
		),
		plan: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{ type: 'prepare_glass', mode: 'chill' },
				{ type: 'add', target: 'mixing', items: [ml(i.rum), ml(i.limeJuice), ml(i.syrup)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: 12 },
				{ type: 'strain', kind: 'single' },
				{ type: 'garnish', items: [garnishRef(i.lime, units.wedge, true)], style: 'rim_perch' },
			],
		},
	},
	{
		name: 'old fashioned (built in the glass)',
		drink: drink(
			[line(i.whisky, exact(60)), line(i.syrup, exact(10)), line(i.bitters, exact(2, units.dash))],
			[garnishLine(i.orange, exact(1, units.twist))],
		),
		plan: {
			mixingVessel: 'serving_glass',
			servingGlass: 'rocks',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [
						ml(i.whisky),
						ml(i.syrup),
						{ list: 'ingredients', ingredientId: i.bitters.id, unitId: units.dash.id, withUnit: true },
					],
				},
				{ type: 'add_ice', target: 'mixing', kind: 'large_cube' },
				{ type: 'stir', seconds: 30 },
				{ type: 'garnish', items: [garnishRef(i.orange, units.twist, true)], style: 'express' },
			],
		},
	},
	{
		name: 'mojito (muddled and built, topped)',
		drink: drink(
			[
				line(i.mint, exact(8, units.leaf)),
				line(i.limeJuice, exact(25)),
				line(i.syrup, exact(15)),
				line(i.rum, exact(50)),
				line(i.tonic, exact(100)),
			],
			[garnishLine(i.mint, exact(1, units.sprig)), garnishLine(i.lime, exact(1, units.wedge))],
		),
		plan: {
			mixingVessel: 'serving_glass',
			servingGlass: 'highball',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [
						{ list: 'ingredients', ingredientId: i.mint.id, unitId: units.leaf.id, withUnit: true },
						ml(i.limeJuice),
						ml(i.syrup),
					],
				},
				{ type: 'muddle', intensity: 'gentle' },
				{ type: 'add', target: 'mixing', items: [ml(i.rum)] },
				{ type: 'add_ice', target: 'mixing', kind: 'crushed' },
				{ type: 'top', item: ml(i.tonic) },
				{
					type: 'garnish',
					items: [garnishRef(i.mint, units.sprig, true), garnishRef(i.lime, units.wedge, true)],
				},
			],
		},
	},
	{
		name: 'margarita (half rim, shaken)',
		drink: drink(
			[line(i.tequila, exact(50)), line(i.tripleSec, exact(25)), line(i.limeJuice, exact(25))],
			[garnishLine(i.salt)],
		),
		plan: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{ type: 'prepare_glass', mode: 'rim', item: garnishRef(i.salt), coverage: 'half' },
				{ type: 'add', target: 'mixing', items: [ml(i.tequila), ml(i.tripleSec), ml(i.limeJuice)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake' },
				{ type: 'strain', kind: 'double' },
			],
		},
	},
	{
		name: 'negroni (stirred in a mixing glass, over ice)',
		drink: drink([line(i.gin), line(i.campari), line(i.vermouth)], [garnishLine(i.orange, exact(1, units.twist))]),
		plan: {
			mixingVessel: 'mixing_glass',
			servingGlass: 'rocks',
			actions: [
				{ type: 'add_ice', target: 'serving', kind: 'large_cube' },
				{ type: 'add', target: 'mixing', items: [ml(i.gin), ml(i.campari), ml(i.vermouth)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'stir', revolutions: 30 },
				{ type: 'strain', kind: 'single', overIce: true },
				{ type: 'garnish', items: [garnishRef(i.orange, units.twist, true)], style: 'flame' },
			],
		},
	},
	{
		name: 'whisky sour (dry shake first)',
		drink: drink(
			[
				line(i.whisky, exact(60)),
				line(i.lemonJuice, exact(25)),
				line(i.syrup, exact(15)),
				line(i.eggWhite, exact(1)),
			],
			[garnishLine(i.cherry)],
		),
		plan: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{
					type: 'add',
					target: 'mixing',
					items: [
						ml(i.whisky),
						ml(i.lemonJuice),
						ml(i.syrup),
						{ list: 'ingredients', ingredientId: i.eggWhite.id, unitId: units.ml.id },
					],
				},
				{ type: 'shake', intensity: 'vigorous', seconds: 10 },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake', intensity: 'vigorous', seconds: 12 },
				{ type: 'strain', kind: 'fine' },
				{ type: 'garnish', items: [garnishRef(i.cherry)] },
			],
		},
	},
	{
		name: 'whisky sour (reverse dry shake)',
		drink: drink([line(i.whisky, exact(60)), line(i.lemonJuice, exact(25)), line(i.syrup, exact(15))]),
		plan: {
			mixingVessel: 'shaker',
			servingGlass: 'coupe',
			actions: [
				{ type: 'add', target: 'mixing', items: [ml(i.whisky), ml(i.lemonJuice), ml(i.syrup)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'shake' },
				{ type: 'strain', kind: 'single', to: 'mixing' },
				{ type: 'shake', intensity: 'vigorous' },
				{ type: 'strain', kind: 'fine' },
			],
		},
	},
	{
		name: 'sazerac (rinsed glass, stirred)',
		drink: drink(
			[line(i.whisky, exact(60)), line(i.syrup, exact(5)), line(i.absinthe, exact(5))],
			[garnishLine(i.orange, exact(1, units.twist))],
		),
		plan: {
			mixingVessel: 'mixing_glass',
			servingGlass: 'rocks',
			actions: [
				{ type: 'prepare_glass', mode: 'rinse', item: ml(i.absinthe) },
				{ type: 'add', target: 'mixing', items: [ml(i.whisky), ml(i.syrup)] },
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'stir', seconds: 25 },
				{ type: 'strain', kind: 'single' },
				{ type: 'garnish', items: [garnishRef(i.orange, units.twist, true)], style: 'express_and_discard' },
			],
		},
	},
	{
		name: 'gin and tonic (built, with a custom step)',
		drink: drink([line(i.gin, exact(50)), line(i.tonic, exact(150))], [garnishLine(i.lime, exact(1, units.wedge))]),
		plan: {
			mixingVessel: 'serving_glass',
			servingGlass: 'collins',
			actions: [
				{ type: 'add_ice', target: 'mixing', kind: 'cubes' },
				{ type: 'add', target: 'mixing', items: [ml(i.gin)] },
				{ type: 'top', item: ml(i.tonic) },
				{
					type: 'custom',
					text: { en: 'Stir once, gently.', pt: 'Mexa uma vez, com delicadeza.' },
				},
				{ type: 'garnish', items: [garnishRef(i.lime, units.wedge, true)] },
			],
		},
	},
	{
		name: 'vodka over ice (ingredient with no unit, branded name)',
		drink: drink([line(i.vodka, { type: 'none' }), line(i.campari, { type: 'none' })]),
		plan: {
			mixingVessel: 'serving_glass',
			servingGlass: 'shot',
			actions: [
				{ type: 'prepare_glass', mode: 'warm' },
				{ type: 'add', target: 'mixing', items: [bare(i.vodka), bare(i.campari)] },
			],
		},
	},
];
