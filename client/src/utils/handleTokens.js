import { jwtDecode } from 'jwt-decode';

export const setToken = (Tokens) => {
	try {
		localStorage.setItem('accessToken', Tokens.accessToken);
		localStorage.setItem('refreshToken', Tokens.refreshToken);
	} catch (err) {
		console.error('Error saving token', err);
	}
};

export const getToken = () => {
	try {
		const accessToken = localStorage.getItem('accessToken');
		const refreshToken = localStorage.getItem('refreshToken');
		return { accessToken, refreshToken };
	} catch (err) {
		console.error('Error retrieving token', err);
		return { accessToken: null, refreshToken: null };
	}
};

export const removeToken = () => {
	try {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	} catch (err) {
		console.error('Error removing token', err);
	}
};

export const decodeToken = (token) => {
	try {
		if (!token || typeof token !== 'string') return null;
		return jwtDecode(token);
	} catch (err) {
		console.error('Error decoding token', err);
		return null;
	}
};

export const isTokenExpired = (token) => {
	if (!token) return true;
	const decoded = decodeToken(token);
	if (!decoded || !decoded.exp) return true;
	return Date.now() >= decoded.exp * 1000;
};

export const isTokenValid = () => {
	const { accessToken } = getToken();
	return accessToken && !isTokenExpired(accessToken);
};

export const shouldBeAuthenticated = () => {
	const { accessToken, refreshToken } = getToken();
	return !!(accessToken || refreshToken);
};
