import { Language } from '@/core/drinks/types/translations';
import { IceKind, Intensity } from '@/core/drinks/modules/preparation/types/technique.types';
import { PhysicalVessel, ServingGlass } from '@/core/drinks/modules/preparation/types/vessel.types';
import { Gender } from '@/shared/types/gender.types';

/** Which article goes before a recipe item: "a vodka" (definite), "uma fatia" (indefinite) or none. */
export type ArticleKind = 'definite' | 'indefinite' | 'none';

/** A noun phrase base. `gender` is only used by languages that need it. */
export type Noun = { name: string; gender?: 'm' | 'f' };

/** How a vessel is referred to in a sentence (the preposition is part of the form). */
export type Form = 'the' | 'in' | 'into' | 'to' | 'from' | 'of';

/** `first` marks the first mention of a vessel, which reads as indefinite ("a martini glass"). */
export type Mention = { noun: Noun; first: boolean };

/**
 * The vocabulary and grammar shared by every action in one language. The sentences themselves live
 * with each action (`actions/<name>/<name>.locale.ts`).
 */
export type PreparationLocale = {
	code: Language;
	/** BCP 47 tag used for number, plural and list formatting. */
	intl: string;
	/** Connector used in "wedge of lime". */
	of: string;
	vessels: Record<Exclude<PhysicalVessel, 'serving_glass'>, Noun>;
	glasses: Record<ServingGlass, Noun>;
	ice: Record<IceKind, string>;
	adverbs: Record<Intensity, string>;
	/** Muddling has its own wording: "vigorously" fits a shake, not crushing fruit. */
	muddleAdverbs: Record<Intensity, string>;
	ref(mention: Mention, form: Form): string;
	/**
	 * Article for a recipe item, empty when the language or the data does not provide one. `following` is the
	 * word that comes right after it, for languages where the article depends on it ("a wedge", "an orange").
	 */
	article(input: { gender?: Gender; plural: boolean; kind: ArticleKind; following?: string }): string;
	list(items: string[]): string;
	duration(input: { seconds?: number; revolutions?: number }): string;
};
