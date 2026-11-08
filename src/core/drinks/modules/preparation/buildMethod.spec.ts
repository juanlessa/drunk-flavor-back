import { describe, expect, it } from 'vitest';
import { buildMethod } from '@/core/drinks/modules/preparation';
import { preparationExamples } from './testing/preparation.examples';

// The written method of each example recipe, in both languages. A change in any sentence of the module shows up
// here, so read the new text before updating the expectation.
const expectedMethods: Record<string, { en: string; pt: string }> = {
	'daiquiri (shaken, strained into a coupe)': {
		en: 'Chill a coupe glass. In a shaker, add rum, lime juice, and simple syrup. Add ice cubes. Shake vigorously for 12 seconds. Strain the mixture into the coupe glass. Garnish with a wedge of lime on the rim.',
		pt: 'Gele uma taça coupe. Em uma coqueteleira, adicione o rum, o suco de limão e o xarope simples. Adicione gelo em cubos. Agite vigorosamente por 12 segundos. Coe a mistura para dentro da taça coupe. Decore com um gomo de limão na borda.',
	},
	'old fashioned (built in the glass)': {
		en: 'In a rocks glass, add whisky, simple syrup, and dashes of angostura bitters. Add a large ice cube. Stir for 30 seconds. Express a twist of orange over the drink to release the oils, then use as garnish.',
		pt: 'Em um copo baixo, adicione o whisky, o xarope simples e os dashes de angostura bitters. Adicione uma pedra grande de gelo. Mexa por 30 segundos. Torça um twist de laranja sobre a bebida para liberar os óleos e use para decorar.',
	},
	'mojito (muddled and built, topped)': {
		en: 'In a highball glass, add leaves of mint, lime juice, and simple syrup. Muddle gently. Add rum. Add crushed ice. Top up with tonic water. Garnish with a sprig of mint and a wedge of lime.',
		pt: 'Em um copo long drink, adicione as folhas de hortelã, o suco de limão e o xarope simples. Macere gentilmente. Adicione o rum. Adicione gelo picado. Complete com a água tônica. Decore com um ramo de hortelã e um gomo de limão.',
	},
	'margarita (half rim, shaken)': {
		en: 'Rim half of a coupe glass with salt. In a shaker, add tequila, triple sec, and lime juice. Add ice cubes. Shake. Double strain the mixture (strainer + fine-mesh strainer) into the coupe glass.',
		pt: 'Passe o sal em metade da borda de uma taça coupe. Em uma coqueteleira, adicione a tequila, o triple sec e o suco de limão. Adicione gelo em cubos. Agite. Faça uma dupla coagem da mistura (strainer + peneira) para dentro da taça coupe.',
	},
	'negroni (stirred in a mixing glass, over ice)': {
		en: 'In a rocks glass, add a large ice cube. In a mixing glass, add gin, Campari, and sweet vermouth. Add ice cubes. Stir for 30 revolutions. Strain the mixture into the rocks glass over the ice. Flame a twist of orange over the drink to release the oils, then use as garnish.',
		pt: 'Em um copo baixo, adicione uma pedra grande de gelo. Em um copo misturador, adicione o gin, o Campari e o vermute doce. Adicione gelo em cubos. Mexa por 30 voltas. Coe a mistura para dentro do copo baixo sobre o gelo. Flambe um twist de laranja sobre a bebida para liberar os óleos e use para decorar.',
	},
	'whisky sour (dry shake first)': {
		en: 'In a shaker, add whisky, lemon juice, simple syrup, and egg white. Dry shake vigorously (without ice) for 10 seconds. Add ice cubes. Shake vigorously for 12 seconds. Fine strain the mixture into a coupe glass. Garnish with cherry.',
		pt: 'Em uma coqueteleira, adicione o whisky, o suco de limão siciliano, o xarope simples e a clara de ovo. Agite vigorosamente sem gelo (dry shake) por 10 segundos. Adicione gelo em cubos. Agite vigorosamente por 12 segundos. Coe a mistura com peneira fina para dentro de uma taça coupe. Decore com cereja.',
	},
	'whisky sour (reverse dry shake)': {
		en: 'In a shaker, add whisky, lemon juice, and simple syrup. Add ice cubes. Shake. Strain out the ice and return the mixture to the shaker. Dry shake vigorously (without ice). Fine strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o whisky, o suco de limão siciliano e o xarope simples. Adicione gelo em cubos. Agite. Coe para retirar o gelo e devolva a mistura à coqueteleira. Agite vigorosamente sem gelo (dry shake). Coe a mistura com peneira fina para dentro de uma taça coupe.',
	},
	'sazerac (rinsed glass, stirred)': {
		en: 'Rinse a rocks glass with absinthe and discard the excess. In a mixing glass, add whisky and simple syrup. Add ice cubes. Stir for 25 seconds. Strain the mixture into the rocks glass. Express a twist of orange over the drink to release the oils, then discard.',
		pt: 'Passe o absinto em um copo baixo e descarte o excesso. Em um copo misturador, adicione o whisky e o xarope simples. Adicione gelo em cubos. Mexa por 25 segundos. Coe a mistura para dentro do copo baixo. Torça um twist de laranja sobre a bebida para liberar os óleos e descarte.',
	},
	'gin and tonic (built, with a custom step)': {
		en: 'In a Collins glass, add ice cubes. Add gin. Top up with tonic water. Stir once, gently. Garnish with a wedge of lime.',
		pt: 'Em um copo Collins, adicione gelo em cubos. Adicione o gin. Complete com a água tônica. Mexa uma vez, com delicadeza. Decore com um gomo de limão.',
	},
	'vodka over ice (ingredient with no unit, branded name)': {
		en: 'Warm a shot glass. In the shot glass, add vodka and Campari.',
		pt: 'Aqueça um copo de shot. No copo de shot, adicione a vodka e o Campari.',
	},
};

describe('buildMethod', () => {
	it('has an expected method for every example', () => {
		expect(Object.keys(expectedMethods).sort()).toEqual(preparationExamples.map(({ name }) => name).sort());
	});

	describe.each(preparationExamples)('$name', ({ name, drink, plan }) => {
		it('writes the method in english and portuguese', () => {
			const result = buildMethod(drink, plan);

			expect(result.ok && result.method).toEqual(expectedMethods[name]);
		});

		it('splits the same method into sentences, one per step, and reports no warnings', () => {
			const result = buildMethod(drink, plan);

			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.sentences.en.join(' ')).toBe(result.method.en);
			expect(result.sentences.pt.join(' ')).toBe(result.method.pt);
			expect(result.sentences.en).toHaveLength(plan.actions.length);
			expect(result.warnings).toEqual([]);
		});
	});

	it('does not change the plan or the recipe it receives', () => {
		const [example] = preparationExamples;
		const before = JSON.stringify(example);

		buildMethod(example.drink, example.plan);

		expect(JSON.stringify(example)).toBe(before);
	});
});
