import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { MongoTransactionManager } from './MongoTransactionManager';

const transactionManager: ITransactionManager = new MongoTransactionManager();

export const resolveTransactionManager = () => transactionManager;
