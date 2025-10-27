import { createContext, useEffect, useState, useCallback } from 'react';
import {
	memberLogin,
	memberLogout,
	adminLogin,
	adminLogout,
	adminRegister,
} from '../services/authServices.js';
import { getToken, decodeToken, removeToken, isTokenValid } from '../utils/handleTokens.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	// Function to clear authentication state
	const clearAuth = useCallback(() => {
		setUser(null);
		setIsAuthenticated(false);
		removeToken();
	}, []);

	// Function to validate and load user from token
	const validateAndLoadUser = useCallback(() => {
		const { accessToken } = getToken();

		if (!accessToken) {
			clearAuth();
			setLoading(false);
			return false;
		}

		if (!isTokenValid()) {
			console.log('Token expired, clearing authentication');
			clearAuth();
			setLoading(false);
			return false;
		}

		const decoded = decodeToken(accessToken);
		if (decoded) {
			setUser(decoded);
			setIsAuthenticated(true);
			setLoading(false);
			return true;
		} else {
			clearAuth();
			setLoading(false);
			return false;
		}
	}, [clearAuth]);

	// Load user from token on mount and set up interval checking
	useEffect(() => {
		validateAndLoadUser();

		// Check token validity every minute
		const interval = setInterval(() => {
			if (!isTokenValid()) {
				console.log('Token expired during session, logging out');
				clearAuth();
				// Optionally show a notification here
				if (
					window.location.pathname.includes('/admin') ||
					window.location.pathname.includes('/member')
				) {
					window.location.href = '/auth';
				}
			}
		}, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [validateAndLoadUser, clearAuth]);

	// Member Login
	const loginMember = useCallback(async (credentials) => {
		if (credentials.identifier) {
			if (credentials.identifier.includes('@')) {
				credentials.email = credentials.identifier;
			} else {
				credentials.LpuId = credentials.identifier;
			}
			delete credentials.identifier;
		}
		const data = await memberLogin(credentials);
		const decoded = decodeToken(data.accessToken);
		setUser(decoded);
		setIsAuthenticated(true);
	}, []);

	// Member Logout
	const logoutMember = useCallback(async () => {
		try {
			await memberLogout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			clearAuth();
		}
	}, [clearAuth]);

	// Admin Login
	const loginAdmin = useCallback(async (credentials) => {
		const data = await adminLogin(credentials);
		const decoded = decodeToken(data.accessToken);
		setUser(decoded);
		setIsAuthenticated(true);
	}, []);

	// Admin Register
	const registerAdmin = useCallback(async (details) => {
		const data = await adminRegister(details);
		const decoded = decodeToken(data.accessToken);
		setUser(decoded);
		setIsAuthenticated(true);
	}, []);

	// Admin Logout
	const logoutAdmin = useCallback(async () => {
		try {
			await adminLogout();
		} catch (error) {
			console.error('Admin logout error:', error);
		} finally {
			clearAuth();
		}
	}, [clearAuth]);

	// Function to manually revalidate authentication
	const revalidateAuth = useCallback(() => {
		return validateAndLoadUser();
	}, [validateAndLoadUser]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				loading,
				loginMember,
				logoutMember,
				loginAdmin,
				registerAdmin,
				logoutAdmin,
				revalidateAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
