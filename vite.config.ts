import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'generateSW',
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
					},
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				additionalManifestEntries: [
					{ url: '/', revision: null }
				],
				navigateFallback: '/',
				navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
				skipWaiting: true,
				clientsClaim: true,
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							plugins: [
								{
									cacheKeyWillBeUsed: async ({ request }) => '/'
								}
							]
						}
					}
				]
			}
		})
	]
});
