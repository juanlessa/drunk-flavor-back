import { DayjsProvider } from './implementations/DayjsProvider';

const dateProvider = new DayjsProvider();
export const resolveDateProvider = () => dateProvider;
