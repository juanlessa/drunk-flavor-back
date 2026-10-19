import mongoose from 'mongoose';
import { ITransactionManager, TransactionWork } from '@/shared/transactions/ITransactionManager';

export class MongoTransactionManager implements ITransactionManager {
	withTransaction<TResult>(work: TransactionWork<TResult>): Promise<TResult> {
		return mongoose.connection.transaction(() => work());
	}
}
