import { DayjsDateProvider } from './implementations/DayjsDateProvider';

const dateProvider = new DayjsDateProvider();
export const resolveDateProvider = () => dateProvider;
