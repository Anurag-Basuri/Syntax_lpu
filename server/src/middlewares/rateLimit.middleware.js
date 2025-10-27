import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

let rateLimiter = null;

export const initRateLimiter = async () => {
	if (process.env.NODE_ENV === 'production') {
		const { default: RedisStore } = await import('rate-limit-redis');
		const Redis = (await import('ioredis')).default;
		const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

		rateLimiter = rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
			standardHeaders: true,
			legacyHeaders: false,
			keyGenerator: ipKeyGenerator, // Use the helper for proper IP handling
			store: new RedisStore({
				sendCommand: (...args) => redisClient.call(...args),
				prefix: 'rate-limit:',
			}),
		});
	} else {
		rateLimiter = rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
			standardHeaders: true,
			legacyHeaders: false,
			keyGenerator: ipKeyGenerator, // Use the helper for proper IP handling
		});
	}
};

// Export the initialized limiter for usage
export { rateLimiter };

// Optional placeholder for cache middleware
export const cacheMiddleware = (duration) => {
	return async (req, res, next) => {
		next();
	};
};
