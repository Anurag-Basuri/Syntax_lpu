import { apiClient, publicClient } from './api.js';
import { setToken, getToken, removeToken } from '../utils/handleTokens.js';

// Function to handle authentication errors globally
const handleAuthError = (error) => {
	if (error.response) {
		const { status } = error.response;

		if (status === 401) {
			removeToken();
			window.location.href = '/auth'; // Or use router redirect
		}
	}
	return Promise.reject(error);
};

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		handleAuthError(error);
		return Promise.reject(error);
	}
);

export const memberRegister = async (data) => {
	try {
		const response = await apiClient.post('/api/members/register', data);

		return response.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const memberLogin = async (data) => {
	try {
		const response = await publicClient.post('/api/members/login', data);

		const { accessToken, refreshToken } = response.data.data;
		setToken({ accessToken, refreshToken });
		return response.data.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const memberLogout = async () => {
	try {
		console.log('Member logout successful');
		const response = await apiClient.post('/api/members/logout');
		removeToken(); // Clear tokens on logout
		return response.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const adminRegister = async (data) => {
	try {
		const response = await apiClient.post('/api/admin/register', data);

		const { accessToken, refreshToken } = response.data.data;
		setToken({ accessToken, refreshToken });

		return response.data.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const adminLogin = async (data) => {
	try {
		const response = await apiClient.post('/api/admin/login', data);

		const { accessToken, refreshToken } = response.data.data;
		setToken({ accessToken, refreshToken });

		return response.data.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const adminLogout = async () => {
	try {
		const { refreshToken } = getToken();
		const response = await apiClient.post('/api/admin/logout', { refreshToken });

		removeToken(); // Clear tokens on logout
		return response.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};

export const getCurrentAdmin = async () => {
	try {
		const response = await apiClient.get('/api/admin/me');
		return response.data;
	} catch (error) {
		handleAuthError(error);
		throw error;
	}
};
