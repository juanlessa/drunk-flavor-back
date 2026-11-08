import { describe, expect, it } from 'vitest';
import { buildMethod } from '@/core/drinks/modules/preparation';
import { wordingCases } from './testing/wording.cases';

// How each technique, style and option reads in both languages. Read the new text before updating an expectation.
const expectedWording: Record<string, { en: string; pt: string; warnings: string[] }> = {
	'garnish style default': {
		en: 'In a rocks glass, add whisky. Garnish with a twist of orange.',
		pt: 'Em um copo baixo, adicione o whisky. Decore com um twist de laranja.',
		warnings: [],
	},
	'garnish style express': {
		en: 'In a rocks glass, add whisky. Express a twist of orange over the drink to release the oils, then use as garnish.',
		pt: 'Em um copo baixo, adicione o whisky. Torça um twist de laranja sobre a bebida para liberar os óleos e use para decorar.',
		warnings: [],
	},
	'garnish style express_and_discard': {
		en: 'In a rocks glass, add whisky. Express a twist of orange over the drink to release the oils, then discard.',
		pt: 'Em um copo baixo, adicione o whisky. Torça um twist de laranja sobre a bebida para liberar os óleos e descarte.',
		warnings: [],
	},
	'garnish style flame': {
		en: 'In a rocks glass, add whisky. Flame a twist of orange over the drink to release the oils, then use as garnish.',
		pt: 'Em um copo baixo, adicione o whisky. Flambe um twist de laranja sobre a bebida para liberar os óleos e use para decorar.',
		warnings: [],
	},
	'garnish style flame_and_discard': {
		en: 'In a rocks glass, add whisky. Flame a twist of orange over the drink to release the oils, then discard.',
		pt: 'Em um copo baixo, adicione o whisky. Flambe um twist de laranja sobre a bebida para liberar os óleos e descarte.',
		warnings: [],
	},
	'garnish style skewer': {
		en: 'In a rocks glass, add whisky. Garnish with a twist of orange on a skewer.',
		pt: 'Em um copo baixo, adicione o whisky. Decore com um twist de laranja em um espeto.',
		warnings: [],
	},
	'garnish style rim_perch': {
		en: 'In a rocks glass, add whisky. Garnish with a twist of orange on the rim.',
		pt: 'Em um copo baixo, adicione o whisky. Decore com um twist de laranja na borda.',
		warnings: [],
	},
	'garnish style float': {
		en: 'In a rocks glass, add whisky. Float a twist of orange on top.',
		pt: 'Em um copo baixo, adicione o whisky. Coloque um twist de laranja por cima.',
		warnings: [],
	},
	'garnish style sprinkle': {
		en: 'In a rocks glass, add whisky. Sprinkle a twist of orange on top.',
		pt: 'Em um copo baixo, adicione o whisky. Polvilhe um twist de laranja por cima.',
		warnings: [],
	},
	'strain single': {
		en: 'In a shaker, add gin. Add ice cubes. Shake. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'strain single over ice': {
		en: 'In a coupe glass, add ice cubes. In a shaker, add gin. Add ice cubes. Shake. Strain the mixture into the coupe glass over the ice.',
		pt: 'Em uma taça coupe, adicione gelo em cubos. Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Coe a mistura para dentro da taça coupe sobre o gelo.',
		warnings: [],
	},
	'strain double': {
		en: 'In a shaker, add gin. Add ice cubes. Shake. Double strain the mixture (strainer + fine-mesh strainer) into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Faça uma dupla coagem da mistura (strainer + peneira) para dentro de uma taça coupe.',
		warnings: [],
	},
	'strain double over ice': {
		en: 'In a coupe glass, add ice cubes. In a shaker, add gin. Add ice cubes. Shake. Double strain the mixture (strainer + fine-mesh strainer) into the coupe glass over the ice.',
		pt: 'Em uma taça coupe, adicione gelo em cubos. Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Faça uma dupla coagem da mistura (strainer + peneira) para dentro da taça coupe sobre o gelo.',
		warnings: [],
	},
	'strain fine': {
		en: 'In a shaker, add gin. Add ice cubes. Shake. Fine strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Coe a mistura com peneira fina para dentro de uma taça coupe.',
		warnings: [],
	},
	'strain fine over ice': {
		en: 'In a coupe glass, add ice cubes. In a shaker, add gin. Add ice cubes. Shake. Fine strain the mixture into the coupe glass over the ice.',
		pt: 'Em uma taça coupe, adicione gelo em cubos. Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Coe a mistura com peneira fina para dentro da taça coupe sobre o gelo.',
		warnings: [],
	},
	'strain none': {
		en: 'In a shaker, add gin. Add ice cubes. Shake. Pour the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Despeje a mistura em uma taça coupe.',
		warnings: ['ice_poured_into_glass'],
	},
	'strain none over ice': {
		en: 'In a coupe glass, add ice cubes. In a shaker, add gin. Add ice cubes. Shake. Pour the mixture into the coupe glass over the ice.',
		pt: 'Em uma taça coupe, adicione gelo em cubos. Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Despeje a mistura na taça coupe sobre o gelo.',
		warnings: ['ice_poured_into_glass'],
	},
	'shake gentle': {
		en: 'In a shaker, add gin. Add ice cubes. Shake gently. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite gentilmente. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'muddle gentle': {
		en: 'In a shaker, add mint. Muddle gently. Add gin. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione a hortelã. Macere gentilmente. Adicione o gin. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'shake normal': {
		en: 'In a shaker, add gin. Add ice cubes. Shake. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'muddle normal': {
		en: 'In a shaker, add mint. Muddle. Add gin. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione a hortelã. Macere. Adicione o gin. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'shake vigorous': {
		en: 'In a shaker, add gin. Add ice cubes. Shake vigorously. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite vigorosamente. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'muddle vigorous': {
		en: 'In a shaker, add mint. Muddle firmly. Add gin. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione a hortelã. Macere com firmeza. Adicione o gin. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'shake for one second': {
		en: 'In a shaker, add gin. Add ice cubes. Shake for 1 second. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite por 1 segundo. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'shake for several seconds': {
		en: 'In a shaker, add gin. Add ice cubes. Shake for 15 seconds. Strain the mixture into a coupe glass.',
		pt: 'Em uma coqueteleira, adicione o gin. Adicione gelo em cubos. Agite por 15 segundos. Coe a mistura para dentro de uma taça coupe.',
		warnings: [],
	},
	'stir for one revolution': {
		en: 'In a rocks glass, add gin. Add ice cubes. Stir for 1 revolution.',
		pt: 'Em um copo baixo, adicione o gin. Adicione gelo em cubos. Mexa por 1 volta.',
		warnings: [],
	},
	'stir for several seconds, gently': {
		en: 'In a rocks glass, add gin. Add ice cubes. Stir gently for 20 seconds.',
		pt: 'Em um copo baixo, adicione o gin. Adicione gelo em cubos. Mexa gentilmente por 20 segundos.',
		warnings: [],
	},
	'chill the glass': {
		en: 'Chill a rocks glass. In the rocks glass, add gin.',
		pt: 'Gele um copo baixo. No copo baixo, adicione o gin.',
		warnings: [],
	},
	'warm the glass': {
		en: 'Warm a rocks glass. In the rocks glass, add gin.',
		pt: 'Aqueça um copo baixo. No copo baixo, adicione o gin.',
		warnings: [],
	},
	'rinse the glass': {
		en: 'Rinse a rocks glass with absinthe and discard the excess. In the rocks glass, add gin.',
		pt: 'Passe o absinto em um copo baixo e descarte o excesso. No copo baixo, adicione o gin.',
		warnings: [],
	},
	'rim the whole glass': {
		en: 'Rim a rocks glass with salt. In the rocks glass, add gin and absinthe.',
		pt: 'Passe o sal na borda de um copo baixo. No copo baixo, adicione o gin e o absinto.',
		warnings: [],
	},
	'rim half of the glass': {
		en: 'Rim half of a rocks glass with salt. In the rocks glass, add gin and absinthe.',
		pt: 'Passe o sal em metade da borda de um copo baixo. No copo baixo, adicione o gin e o absinto.',
		warnings: [],
	},
	'ice cubes': {
		en: 'In a rocks glass, add gin. Add ice cubes.',
		pt: 'Em um copo baixo, adicione o gin. Adicione gelo em cubos.',
		warnings: [],
	},
	'ice crushed': {
		en: 'In a rocks glass, add gin. Add crushed ice.',
		pt: 'Em um copo baixo, adicione o gin. Adicione gelo picado.',
		warnings: [],
	},
	'ice large_cube': {
		en: 'In a rocks glass, add gin. Add a large ice cube.',
		pt: 'Em um copo baixo, adicione o gin. Adicione uma pedra grande de gelo.',
		warnings: [],
	},
	'ice sphere': {
		en: 'In a rocks glass, add gin. Add an ice sphere.',
		pt: 'Em um copo baixo, adicione o gin. Adicione uma esfera de gelo.',
		warnings: [],
	},
	'consecutive adds are written as one sentence': {
		en: 'In a rocks glass, add gin, simple syrup, and lime juice.',
		pt: 'Em um copo baixo, adicione o gin, o xarope simples e o suco de limão.',
		warnings: [],
	},
	'consecutive garnishes of the same style are written as one sentence': {
		en: 'In a rocks glass, add gin, simple syrup, and lime juice. Garnish with a sprig of mint and a wedge of lime.',
		pt: 'Em um copo baixo, adicione o gin, o xarope simples e o suco de limão. Decore com um ramo de hortelã e um gomo de limão.',
		warnings: [],
	},
	'garnishes of different styles stay apart': {
		en: 'In a rocks glass, add gin, simple syrup, and lime juice. Float a sprig of mint on top. Garnish with a wedge of lime on a skewer.',
		pt: 'Em um copo baixo, adicione o gin, o xarope simples e o suco de limão. Coloque um ramo de hortelã por cima. Decore com um gomo de limão em um espeto.',
		warnings: [],
	},
	'a unit is named only when asked, and takes the plural of the quantity': {
		en: 'In a rocks glass, add gin, simple syrup, and lime juice. Garnish with wedges of lime and mint.',
		pt: 'Em um copo baixo, adicione o gin, o xarope simples e o suco de limão. Decore com gomos de limão e hortelã.',
		warnings: [],
	},
	'the english article is "an" before a vowel': {
		en: 'In a rocks glass, add gin. Garnish with an ounce of orange.',
		pt: 'Em um copo baixo, adicione o gin. Decore com uma onça de laranja.',
		warnings: [],
	},
};

describe('wording of the method', () => {
	it('has an expectation for every case', () => {
		expect(Object.keys(expectedWording).sort()).toEqual(wordingCases.map(({ title }) => title).sort());
	});

	it.each(wordingCases)('$title', ({ title, drink, plan }) => {
		const result = buildMethod(drink, plan);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const { warnings, ...method } = expectedWording[title];
		expect(result.method).toEqual(method);
		expect(result.warnings.map(({ code }) => code)).toEqual(warnings);
	});
});
