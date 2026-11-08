/** Joins the non-empty parts with single spaces. */
export const words = (...parts: (string | false | undefined)[]): string => parts.filter(Boolean).join(' ');

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase() + text.slice(1);
const lowerFirst = (text: string): string => text.charAt(0).toLocaleLowerCase() + text.slice(1);

/**
 * Turns a clause into a sentence. With a location it leads the sentence:
 * "In a shaker, add vodka." / "Em uma coqueteleira, adicione a vodka."
 */
export const toSentence = (clause: string, location?: string): string =>
	location ? `${capitalize(location)}, ${lowerFirst(clause)}.` : `${clause}.`;
