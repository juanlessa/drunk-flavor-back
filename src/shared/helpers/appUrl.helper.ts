/** Origin the API listens on, derived from its host and port. */
export const buildAppUrl = ({ API_HOST, API_PORT }: { API_HOST: string; API_PORT: number }): string =>
	`http://${API_HOST}:${API_PORT}`;
