import { MjmlProvider } from './implementations/Mjml.provider';

const templateProvider = new MjmlProvider();
export const resolveTemplateProvider = () => templateProvider;
