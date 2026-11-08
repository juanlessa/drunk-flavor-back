import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';
import { actionDefinitions } from '@/core/drinks/modules/preparation/actions';
import { PreparationActionType } from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationEvent } from '@/core/drinks/modules/preparation/entities/preparationEvent.entity';
import { PreparationPlan } from '@/core/drinks/modules/preparation/entities/preparationPlan.entity';
import { Language } from '@/core/drinks/types/translations';
import { createRenderContext } from './renderContext';

/** The definition of the action an event belongs to. */
const definitionOf = (event: PreparationEvent) =>
	actionDefinitions[event.type] as ActionDefinition<PreparationActionType>;

/**
 * Folds consecutive events that read better as one sentence ("add A", "add B" -> "add A and B"). Which
 * events can be folded, and how, is decided by the action itself.
 */
const mergeEvents = (events: PreparationEvent[]): PreparationEvent[] =>
	events.reduce<PreparationEvent[]>((merged, event) => {
		const previous = merged[merged.length - 1];
		const folded = previous?.type === event.type ? definitionOf(event).merge?.(previous, event) : undefined;
		if (folded) merged[merged.length - 1] = folded;
		else merged.push(event);
		return merged;
	}, []);

/** Writes the events of a plan as sentences, one per entry, in one language. */
export const renderSentences = (events: PreparationEvent[], plan: PreparationPlan, language: Language): string[] => {
	const context = createRenderContext(plan, language);
	return mergeEvents(events).map((event) => definitionOf(event).render(event, context));
};
