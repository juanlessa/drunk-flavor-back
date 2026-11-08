import { ActionDefinition } from '@/core/drinks/modules/preparation/actions/actionDefinition.types';

/** The text is already written by the author, in each language: there are no sentences to compose. */
export const renderCustom: ActionDefinition<'custom'>['render'] = (event, { language }) => event.text[language].trim();
