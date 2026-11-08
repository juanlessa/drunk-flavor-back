import { Form, Mention, PreparationLocale } from './types';

const listFormat = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });

const definite = {
	m: { the: 'o', in: 'no', to: 'ao', from: 'do', indefinite: 'um' },
	f: { the: 'a', in: 'na', to: 'à', from: 'da', indefinite: 'uma' },
} as const;

const ref = ({ noun, first }: Mention, form: Form): string => {
	const article = definite[noun.gender ?? 'm'];
	// `of` and `from` contract the same way in Portuguese ("da taça", "do copo").
	const key = form === 'into' ? 'in' : form === 'of' ? 'from' : form;

	if (!first) return `${article[key]} ${noun.name}`;

	const indefinite = `${article.indefinite} ${noun.name}`;
	switch (key) {
		case 'the':
			return indefinite;
		case 'in':
			return `em ${indefinite}`;
		case 'to':
			return `a ${indefinite}`;
		case 'from':
			return `de ${indefinite}`;
	}
};

const itemArticles = {
	definite: { masculine: ['o', 'os'], feminine: ['a', 'as'] },
	// There is no plural indefinite article in recipes ("gomos de limão", not "uns gomos").
	indefinite: { masculine: ['um', ''], feminine: ['uma', ''] },
} as const;

export const pt: PreparationLocale = {
	code: 'pt',
	intl: 'pt-BR',
	of: 'de',
	vessels: {
		shaker: { name: 'coqueteleira', gender: 'f' },
		mixing_glass: { name: 'copo misturador', gender: 'm' },
		pitcher: { name: 'jarra', gender: 'f' },
	},
	glasses: {
		martini: { name: 'taça martini', gender: 'f' },
		coupe: { name: 'taça coupe', gender: 'f' },
		nick_and_nora: { name: 'taça Nick and Nora', gender: 'f' },
		flute: { name: 'taça flûte', gender: 'f' },
		highball: { name: 'copo long drink', gender: 'm' },
		collins: { name: 'copo Collins', gender: 'm' },
		rocks: { name: 'copo baixo', gender: 'm' },
		double_rocks: { name: 'copo baixo grande', gender: 'm' },
		hurricane: { name: 'taça hurricane', gender: 'f' },
		copper_mug: { name: 'caneca de cobre', gender: 'f' },
		wine: { name: 'taça de vinho', gender: 'f' },
		shot: { name: 'copo de shot', gender: 'm' },
		snifter: { name: 'taça snifter', gender: 'f' },
		julep_cup: { name: 'copo julep', gender: 'm' },
		tiki_mug: { name: 'caneca tiki', gender: 'f' },
		heatproof_mug: { name: 'caneca resistente ao calor', gender: 'f' },
	},
	ice: {
		cubes: 'gelo em cubos',
		crushed: 'gelo picado',
		large_cube: 'uma pedra grande de gelo',
		sphere: 'uma esfera de gelo',
	},
	adverbs: { gentle: 'gentilmente', normal: '', vigorous: 'vigorosamente' },
	muddleAdverbs: { gentle: 'gentilmente', normal: '', vigorous: 'com firmeza' },
	ref,
	article: ({ gender, plural, kind }) => {
		if (kind === 'none' || !gender) return '';
		return itemArticles[kind][gender][plural ? 1 : 0];
	},
	list: (items) => listFormat.format(items),
	duration: ({ seconds, revolutions }) => {
		if (seconds !== undefined) return `por ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
		if (revolutions !== undefined) return `por ${revolutions} ${revolutions === 1 ? 'volta' : 'voltas'}`;
		return '';
	},
};
