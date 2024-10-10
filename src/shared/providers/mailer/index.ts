import { NodemailerProvider } from './implementations/Nodemailer.provider';

const mailerProvider = new NodemailerProvider();
export const resolveMailerProvider = () => mailerProvider;
