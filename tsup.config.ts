import { defineConfig } from 'tsup';

export default defineConfig({
	// use rollup for treeshaking
	treeshake: true,
	define: {
		'import.meta.vitest': 'false'
	}
});
