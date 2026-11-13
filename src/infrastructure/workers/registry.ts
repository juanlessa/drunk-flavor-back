import { emailWorkerRegistration } from './email/emailWorker.registration';
import type { IWorkerRegistration } from './IWorkerRegistration';

export const workerRegistry: IWorkerRegistration[] = [emailWorkerRegistration];
