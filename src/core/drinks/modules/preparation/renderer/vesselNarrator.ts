import { MixingVessels } from '@/core/drinks/modules/preparation/constants/vessel.constants';
import { Form, PreparationLocale } from '@/core/drinks/modules/preparation/locale/types';
import { PhysicalVessel, ServingGlass } from '@/core/drinks/modules/preparation/types/vessel.types';

/**
 * Keeps track of how the text talks about vessels:
 * - the first mention of a vessel reads indefinite ("in a shaker"), the next ones definite;
 * - the text has a focus vessel, and actions on it do not repeat its name.
 */
export const createVesselNarrator = (locale: PreparationLocale, servingGlass: ServingGlass) => {
	const mentioned = new Set<PhysicalVessel>();
	let focus: PhysicalVessel | undefined;

	/** The vessel as a noun phrase in the given form ("the shaker", "into a coupe glass"). */
	const mention = (vessel: PhysicalVessel, form: Form): string => {
		const noun = vessel === MixingVessels.servingGlass ? locale.glasses[servingGlass] : locale.vessels[vessel];
		const first = !mentioned.has(vessel);
		mentioned.add(vessel);
		return locale.ref({ noun, first }, form);
	};

	return {
		mention,

		/** Location to lead a sentence with, or undefined when the vessel is already the focus. */
		locate: (vessel: PhysicalVessel): string | undefined => {
			if (focus === vessel) return undefined;
			focus = vessel;
			return mention(vessel, 'in');
		},

		/** Moves the focus without writing anything, for actions that carry the drink elsewhere. */
		focusOn: (vessel: PhysicalVessel): void => {
			focus = vessel;
		},
	};
};

export type VesselNarrator = ReturnType<typeof createVesselNarrator>;
