import { NativeDateProvider } from './implementations/NativeDate.provider';

const dateProvider = new NativeDateProvider();
export const resolveDateProvider = () => dateProvider;
