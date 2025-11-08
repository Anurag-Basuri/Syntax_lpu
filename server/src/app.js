import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { applyCors } from './middlewares/cors.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';
import colors from 'colors';

// --- Route Imports ---
import adminRouter from './routes/admin.routes.js';
import applyRouter from './routes/apply.routes.js';
import arvantisRouter from './routes/arvantis.routes.js';
import contactRouter from './routes/contact.routes.js';
import eventRoutes from './routes/event.routes.js';
import memberRoutes from './routes/member.routes.js';
import socialRouter from './routes/socials.routes.js';
import ticketRouter from './routes/ticket.routes.js';

const app = express();

// --- Core Middlewares ---
app.use(helmet()); // Set security HTTP headers
app.use(applyCors); // Apply custom CORS policy
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// --- Request Logging Middleware (routes visibility) ---
app.use((req, res, next) => {
	const start = process.hrtime.bigint();
	res.on('finish', () => {
		const diffMs = Number(process.hrtime.bigint() - start) / 1e6;
		const status = res.statusCode;

		const statusColor =
			status >= 500 ? 'red' : status >= 400 ? 'yellow' : status >= 300 ? 'cyan' : 'green';

		const methodColorMap = {
			GET: 'blue',
			POST: 'magenta',
			PUT: 'yellow',
			PATCH: 'white',
			DELETE: 'red',
		};
		const methodColored = colors[methodColorMap[req.method] || 'grey'](req.method);
		const statusColored = colors[statusColor](String(status));
		const timeColored = colors.gray(`${diffMs.toFixed(1)}ms`);

		console.log(
			`${colors.bold('[ROUTE]')} ${methodColored} ${colors.gray(req.originalUrl)} => ${statusColored} ${timeColored}`
		);
	});
	next();
});

// --- API Routes ---
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/apply', applyRouter);
app.use('/api/v1/arvantis', arvantisRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/socials', socialRouter);
app.use('/api/v1/tickets', ticketRouter);

// --- Health Check Route ---
app.get('/api/v1/health', (req, res) => {
	return ApiResponse.success(res, { status: 'ok' }, 'API is healthy');
});

// --- 404 Handler (only API namespace) ---
app.use('/api', (req, _res, next) => {
	next(ApiError.NotFound('The requested resource was not found on this server.'));
});

// --- Global Error Handler ---
app.use((err, req, res, _next) => {
	const apiError =
		err instanceof ApiError
			? err
			: new ApiError(err.statusCode || 500, err.message || 'Internal Server Error');

	console.error(
		`❌ [${apiError.statusCode}] ${apiError.message} - ${req.method} ${req.originalUrl}`.red
	);

	if (process.env.NODE_ENV === 'development' && apiError.stack) {
		console.error(apiError.stack.grey);
	}

	return ApiResponse.error(res, apiError);
});

export default app;
