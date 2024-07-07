import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		include: ['src/**/*.e2e-spec.ts'],
		environment: 'mongo',
		threads: false
	}
});
