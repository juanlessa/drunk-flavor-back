import { ITransactionManager, TransactionWork } from '../ITransactionManager';

export class FakeTransactionManager implements ITransactionManager {
	withTransaction<TResult>(work: TransactionWork<TResult>): Promise<TResult> {
		return work();
	}
}
