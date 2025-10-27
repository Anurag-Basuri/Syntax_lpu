import fs from 'fs';
import path from 'path';
import process from 'process';

const ENV_FILE = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const prodEnvPath = path.resolve(ENV_FILE);

const requiredProdVars = ['VITE_BACKEND_URL', 'VITE_FRONTEND_URL', 'VITE_CASHFREE_MODE'];

const checkEnvironment = () => {
	console.log(`🔍 Checking environment configuration in ${ENV_FILE}...\n`);

	// Check if env file exists
	if (!fs.existsSync(prodEnvPath)) {
		console.error(`❌ ${ENV_FILE} file not found!`);
		console.log(`💡 Copy .env.production.template to ${ENV_FILE} and fill in your values`);
		process.exit(1);
	}

	// Read env file
	const envContent = fs.readFileSync(prodEnvPath, 'utf8');
	const envVars = {};

	envContent.split('\n').forEach((line) => {
		if (line.trim() && !line.startsWith('#')) {
			const [key, ...rest] = line.split('=');
			if (key && rest.length > 0) {
				envVars[key.trim()] = rest.join('=').trim();
			}
		}
	});

	// Check required variables
	let hasErrors = false;

	requiredProdVars.forEach((varName) => {
		if (
			!envVars[varName] ||
			envVars[varName].includes('yourdomain.com') ||
			envVars[varName].trim() === ''
		) {
			console.error(`❌ ${varName} is missing or contains placeholder value`);
			hasErrors = true;
		} else {
			console.log(`✅ ${varName}: ${envVars[varName]}`);
		}
	});

	// Check for localhost or 127.0.0.1 in production URLs
	['VITE_BACKEND_URL', 'VITE_FRONTEND_URL'].forEach((varName) => {
		if (envVars[varName] && /(localhost|127\.0\.0\.1)/i.test(envVars[varName])) {
			console.error(`❌ ${varName} should not contain localhost or 127.0.0.1 in production`);
			hasErrors = true;
		}
		if (envVars[varName] && !/^https?:\/\//.test(envVars[varName])) {
			console.error(`❌ ${varName} should start with http:// or https://`);
			hasErrors = true;
		}
	});

	// Check Cashfree mode
	if (envVars.VITE_CASHFREE_MODE && envVars.VITE_CASHFREE_MODE !== 'production') {
		console.warn('⚠️  Warning: Using Cashfree sandbox mode or invalid mode in production');
	}

	if (hasErrors) {
		console.error('\n❌ Environment validation failed!');
		console.log('Please fix the above issues before building for production.');
		process.exit(1);
	}

	console.log('\n✅ Environment validation passed!');
	console.log('🚀 Ready for production build.');
};

checkEnvironment();
