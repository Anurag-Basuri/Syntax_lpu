import cors from 'cors';

const allowedOrigins = [
	process.env.FRONTEND_URL || 'http://localhost:5173',
	'http://localhost:5173',
	'http://localhost:3000',
	'https://orgsyntax.xyz',
	'https://www.orgsyntax.xyz',
	'https://api.orgsyntax.xyz',
];

const corsOptions = {
	origin: function (origin, callback) {
		// allow mobile apps, curl, server-to-server
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			console.log('❌ CORS blocked origin:', origin);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	exposedHeaders: ['Set-Cookie', 'Content-Type'],
	methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};

export const applyCors = cors(corsOptions);
