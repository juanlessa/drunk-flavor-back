import { words } from '@/core/drinks/modules/preparation/helpers/sentence.helpers';
import { Form } from '@/core/drinks/modules/preparation/locale/types';
import { StrainKind } from '@/core/drinks/modules/preparation/types/technique.types';
import { Translations } from '@/core/drinks/types/translations';

export type StrainSentences = {
	/** `glass` writes the serving glass in the form the sentence needs ("into a coupe glass"); call it once. */
	toServing(input: { kind: StrainKind; glass: (form: Form) => string; overIce: boolean }): string;
	/** `vesselTo` is the already written mixing vessel ("à coqueteleira"). */
	backToMixing(vesselTo: string): string;
};

export const strainSentences: Translations<StrainSentences> = {
	en: {
		toServing: ({ kind, glass, overIce }) => {
			const verb = {
				single: 'Strain the mixture',
				double: 'Double strain the mixture (strainer + fine-mesh strainer)',
				fine: 'Fine strain the mixture',
				none: 'Pour the mixture',
			}[kind];
			return words(verb, glass('into'), overIce && 'over the ice');
		},
		backToMixing: (vesselTo) => `Strain out the ice and return the mixture ${vesselTo}`,
	},
	pt: {
		toServing: ({ kind, glass, overIce }) => {
			const verb = {
				single: 'Coe a mistura para dentro',
				double: 'Faça uma dupla coagem da mistura (strainer + peneira) para dentro',
				fine: 'Coe a mistura com peneira fina para dentro',
				none: 'Despeje a mistura',
			}[kind];
			return words(verb, glass(kind === 'none' ? 'in' : 'of'), overIce && 'sobre o gelo');
		},
		backToMixing: (vesselTo) => `Coe para retirar o gelo e devolva a mistura ${vesselTo}`,
	},
};
