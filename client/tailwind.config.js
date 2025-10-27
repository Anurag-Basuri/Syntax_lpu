export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			keyframes: {
				'pulse-slow': {
					'0%, 100%': { opacity: 0.1 },
					'50%': { opacity: 0.2 },
				},
			},
			animation: {
				'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
			},
			screens: {
				xs: '480px',
			},
		},
	},
	plugins: [],
};
