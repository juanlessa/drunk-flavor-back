import type { ManagedConnection } from '@/infrastructure/process/connections';
import type { IWorkerRegistration } from './IWorkerRegistration';

export const resolveWorkerConnections = (
	registrations: IWorkerRegistration[],
	engineConnection: ManagedConnection,
): ManagedConnection[] => {
	const connections = new Map<string, ManagedConnection>([[engineConnection.name, engineConnection]]);
	for (const registration of registrations) {
		for (const connection of registration.connections) {
			if (!connections.has(connection.name)) {
				connections.set(connection.name, connection);
			}
		}
	}
	return [...connections.values()];
};
