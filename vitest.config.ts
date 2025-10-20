import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/test-setup.ts'],
		globals: true,
		server: {
			deps: {
				inline: ['@testing-library/svelte']
			}
		}
	},
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		},
		conditions: mode === 'test' ? ['browser'] : []
	}
}));