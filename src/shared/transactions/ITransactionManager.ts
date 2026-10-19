export type TransactionWork<TResult> = () => Promise<TResult>;

export interface ITransactionManager {
	withTransaction<TResult>(work: TransactionWork<TResult>): Promise<TResult>;
}
