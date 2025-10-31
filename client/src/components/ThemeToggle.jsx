import React, { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			aria-label="Toggle theme"
			onClick={toggleTheme}
			className="fixed right-4 top-4 z-50 glass-card p-2 rounded-xl hover-lift"
		>
			{theme === 'light' ? (
				<div className="flex items-center gap-2">
					<Moon className="w-5 h-5 text-secondary" />
					<span className="text-sm text-secondary">Dark</span>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<Sun className="w-5 h-5 text-secondary" />
					<span className="text-sm text-secondary">Light</span>
				</div>
			)}
		</button>
	);
};

export default ThemeToggle;
