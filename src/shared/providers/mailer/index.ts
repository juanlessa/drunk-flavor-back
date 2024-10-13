import { NodemailerProvider } from './implementations/Nodemailer.provider';
import { nodemailerTransporter } from './implementations/nodemailerTransporter.helper';

const transporter = await nodemailerTransporter();
const mailerProvider = new NodemailerProvider(transporter);
export const resolveMailerProvider = () => mailerProvider;
