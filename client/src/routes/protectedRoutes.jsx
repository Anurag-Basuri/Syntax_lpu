import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { isTokenValid, shouldBeAuthenticated } from '../utils/handleTokens.js';

// Loading component
const AuthLoadingScreen = () => (
	<div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#0f172a] flex items-center justify-center">
		<div className="text-center">
			<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p className="text-blue-300 text-lg font-medium">Checking authentication...</p>
		</div>
	</div>
);

export const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }) => {
	const { isAuthenticated, loading, user, revalidateAuth } = useAuth();
	const location = useLocation();

	useEffect(() => {
		// If we expect to be authenticated but token is invalid, revalidate
		if (shouldBeAuthenticated() && !isTokenValid()) {
			console.log('Token validation failed, revalidating auth...');
			revalidateAuth();
		}
	}, [revalidateAuth]);

	// Show loading while checking authentication
	if (loading) {
		return <AuthLoadingScreen />;
	}

	// Check if authentication is required
	if (requireAuth && !isAuthenticated) {
		console.log('Authentication required but user not authenticated, redirecting to /auth');
		return <Navigate to="/auth" state={{ from: location }} replace />;
	}

	// Check if admin access is required
	if (adminOnly && (!user || !user.adminID)) {
		console.log('Admin access required but user is not admin, redirecting to /auth');
		return <Navigate to="/auth" replace />;
	}

	// If member tries to access admin routes
	if (location.pathname.startsWith('/admin') && user?.memberID) {
		console.log('Member trying to access admin route, redirecting to member dashboard');
		return <Navigate to="/member/dashboard" replace />;
	}

	// If admin tries to access member routes
	if (location.pathname.startsWith('/member') && user?.adminID) {
		console.log('Admin trying to access member route, redirecting to admin dashboard');
		return <Navigate to="/admin/dashboard" replace />;
	}

	return children;
};

export const PublicRoute = ({ children }) => {
	const { isAuthenticated, user, loading } = useAuth();

	// Show loading while checking authentication
	if (loading) {
		return <AuthLoadingScreen />;
	}

	// If already authenticated, redirect to appropriate dashboard
	if (isAuthenticated && user) {
		if (user.adminID) {
			return <Navigate to="/admin/dashboard" replace />;
		} else if (user.memberID) {
			return <Navigate to="/member/dashboard" replace />;
		}
	}

	return children;
};
