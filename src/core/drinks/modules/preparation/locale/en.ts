import { Form, Mention, PreparationLocale } from './types';

const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

const ref = ({ noun, first }: Mention, form: Form): string => {
	const phrase = `${first ? 'a' : 'the'} ${noun.name}`;
	switch (form) {
		case 'the':
			return phrase;
		case 'in':
			return `in ${phrase}`;
		case 'into':
			return `into ${phrase}`;
		case 'to':
			return `to ${phrase}`;
		case 'from':
			return `from ${phrase}`;
		case 'of':
			return `of ${phrase}`;
	}
};

export const en: PreparationLocale = {
	code: 'en',
	intl: 'en-US',
	of: 'of',
	vessels: {
		shaker: { name: 'shaker' },
		mixing_glass: { name: 'mixing glass' },
		pitcher: { name: 'pitcher' },
	},
	glasses: {
		martini: { name: 'martini glass' },
		coupe: { name: 'coupe glass' },
		nick_and_nora: { name: 'Nick and Nora glass' },
		flute: { name: 'flute' },
		highball: { name: 'highball glass' },
		collins: { name: 'Collins glass' },
		rocks: { name: 'rocks glass' },
		double_rocks: { name: 'double rocks glass' },
		hurricane: { name: 'hurricane glass' },
		copper_mug: { name: 'copper mug' },
		wine: { name: 'wine glass' },
		shot: { name: 'shot glass' },
		snifter: { name: 'snifter' },
		julep_cup: { name: 'julep cup' },
		tiki_mug: { name: 'tiki mug' },
		heatproof_mug: { name: 'heatproof mug' },
	},
	ice: {
		cubes: 'ice cubes',
		crushed: 'crushed ice',
		large_cube: 'a large ice cube',
		sphere: 'an ice sphere',
	},
	adverbs: { gentle: 'gently', normal: '', vigorous: 'vigorously' },
	muddleAdverbs: { gentle: 'gently', normal: '', vigorous: 'firmly' },
	ref,
	// English recipes name ingredients without articles ("add vodka, lime juice"). Only a unit that stands for one
	// piece takes one ("a wedge of lime", "an inch of ginger").
	article: ({ plural, kind, following = '' }) => {
		if (kind !== 'indefinite' || plural) return '';
		return /^[aeiou]/i.test(following) ? 'an' : 'a';
	},
	list: (items) => listFormat.format(items),
	duration: ({ seconds, revolutions }) => {
		if (seconds !== undefined) return `for ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
		if (revolutions !== undefined) return `for ${revolutions} ${revolutions === 1 ? 'revolution' : 'revolutions'}`;
		return '';
	},
};
