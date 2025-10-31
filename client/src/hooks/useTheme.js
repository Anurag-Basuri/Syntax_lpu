import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

/**
 * Custom hook to access the theme context.
 * Provides the current theme mode, the effective theme, and functions to change it.
 *
 * @returns {{
 *   mode: 'light' | 'dark' | 'system',
 *   theme: 'light' | 'dark',
 *   setMode: (mode: 'light' | 'dark' | 'system') => void,
 *   toggleMode: () => void
 * }}
 */
export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
