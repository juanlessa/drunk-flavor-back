import { PreparationActionType } from '@/core/drinks/modules/preparation/entities/preparationAction.entity';
import { ActionDefinition } from './actionDefinition.types';
import { addDefinition } from './add';
import { addIceDefinition } from './addIce';
import { customDefinition } from './custom';
import { garnishDefinition } from './garnish';
import { muddleDefinition } from './muddle';
import { prepareGlassDefinition } from './prepareGlass';
import { shakeDefinition } from './shake';
import { stirDefinition } from './stir';
import { strainDefinition } from './strain';
import { topDefinition } from './top';

/**
 * One definition per action type. The mapped type makes it a compile error to add an action to the
 * `PreparationAction` union without defining how it is analyzed and written.
 */
export const actionDefinitions: { [Type in PreparationActionType]: ActionDefinition<Type> } = {
	prepare_glass: prepareGlassDefinition,
	add: addDefinition,
	add_ice: addIceDefinition,
	muddle: muddleDefinition,
	shake: shakeDefinition,
	stir: stirDefinition,
	strain: strainDefinition,
	top: topDefinition,
	garnish: garnishDefinition,
	custom: customDefinition,
};
