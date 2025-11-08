import axios from 'axios';
import { getToken, removeToken, isTokenValid } from '../utils/handleTokens.js';

// Use centralized environment configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Create an Axios instance with default settings
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	withCredentials: true,
});

// Public client for unauthenticated requests
const publicClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	withCredentials: true,
});

apiClient.interceptors.request.use(
	(config) => {
		const { accessToken } = getToken();

		if (accessToken && isTokenValid()) {
			config.headers['Authorization'] = `Bearer ${accessToken}`;
		} else if (accessToken && !isTokenValid()) {
			return Promise.reject(new Error('Token expired'));
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export { apiClient, publicClient };
