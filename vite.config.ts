import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'PiggyBank',
				short_name: 'PiggyBank',
				description: 'A personal finance tracker',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: '/favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
			}
		})
	]
});
