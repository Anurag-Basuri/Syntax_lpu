import cors from 'cors';

const allowedOrigins = [
	process.env.FRONTEND_URL || 'http://localhost:5173',
	'http://localhost:5173',
	'http://localhost:5174',
	'https://vibranta.in',
	'https://www.vibranta.in',
	'https://vibranta.org',
	'https://www.vibranta.org',
	'http://185.199.52.113', // VPS IP
];

export const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin like mobile apps or curl requests
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
	optionsSuccessStatus: 200,
};

export const applyCors = cors(corsOptions);