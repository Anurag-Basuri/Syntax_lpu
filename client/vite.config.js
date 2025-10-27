import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react(), tailwindcss()],

	// Environment variables configuration
	envDir: './',
	envPrefix: 'VITE_',

	// Build configuration
	build: {
		outDir: 'dist',
		sourcemap: mode === 'development',
		minify: mode === 'production' ? 'esbuild' : false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					animations: ['framer-motion'],
				},
			},
		},
	},

	// Development server configuration
	server: {
		port: 5173,
		host: true,
		proxy:
			mode === 'development'
				? {
						'/api': {
							target: 'http://localhost:8000',
							changeOrigin: true,
							secure: false,
						},
					}
				: undefined,
	},

	// Preview server configuration
	preview: {
		port: 4173,
		host: true,
	},
}));
