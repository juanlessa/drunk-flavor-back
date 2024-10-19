import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		environment: 'node',
		coverage: {
			include: ['src/core/**/*', 'src/shared/providers/**/*', 'src/shared/helpers/**/*'],
			exclude: [
				'src/core/**/infra/**/*',
				'src/core/**/schemas/**/*',
				'src/core/**/*.controller.ts',
				'src/core/**/*.schema.ts',
				'src/core/**/*.container.ts',
				'src/shared/providers/**/index.ts',
			],
		},
	},
});
