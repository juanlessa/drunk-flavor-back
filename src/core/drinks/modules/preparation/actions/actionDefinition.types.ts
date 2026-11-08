import { AnalysisContext } from '@/core/drinks/modules/preparation/analyzer/analysisContext';
import {
	PreparationActionOf,
	PreparationActionType,
} from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { PreparationEventOf } from '@/core/drinks/modules/preparation/entities/preparationEvent.entity';
import { RenderContext } from '@/core/drinks/modules/preparation/renderer/renderContext';

/**
 * Everything the module knows about one type of action. Each action folder exports one of these.
 *
 * The action is the plan's data (a command); this definition is what handles it. Analysis runs once per
 * plan and produces language-neutral events. Rendering runs once per language over those events.
 */
export type ActionDefinition<Type extends PreparationActionType> = {
	type: Type;
	/** Validates the action against the simulated state, updates the state and emits events. Never throws. */
	analyze(action: PreparationActionOf<Type>, context: AnalysisContext, actionIndex: number): void;
	/** Writes one event as a sentence (with its final period) in the language of the context. */
	render(event: PreparationEventOf<Type>, context: RenderContext): string;
	/**
	 * Optional. Folds an event into the previous one of the same type when they read better as a single
	 * sentence. Returns undefined when they cannot be folded.
	 */
	merge?(previous: PreparationEventOf<Type>, next: PreparationEventOf<Type>): PreparationEventOf<Type> | undefined;
};
