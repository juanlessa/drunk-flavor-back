import { DayjsProvider } from './implementations/Dayjs.provider';

const dateProvider = new DayjsProvider();
export const resolveDateProvider = () => dateProvider;
