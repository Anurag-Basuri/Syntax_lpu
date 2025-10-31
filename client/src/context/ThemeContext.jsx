import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext({
	mode: 'system', // 'light' | 'dark' | 'system'
	theme: 'dark', // effective: 'light' | 'dark'
	setMode: () => {},
	toggleMode: () => {},
});

const getSystemPrefersLight = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-color-scheme: light)').matches;

const getEffectiveTheme = (mode) => {
	if (mode === 'light') return 'light';
	if (mode === 'dark') return 'dark';
	return getSystemPrefersLight() ? 'light' : 'dark';
};

const setMetaThemeColor = (theme) => {
	const meta = document.querySelector('meta[name="theme-color"]');
	if (!meta) return;
	// Match index.css tokens for top background
	meta.setAttribute('content', theme === 'light' ? '#f7faff' : '#0b1022');
};

const applyTheme = (mode) => {
	const effective = getEffectiveTheme(mode);
	document.documentElement.setAttribute('data-theme', effective);
	document.documentElement.setAttribute('data-theme-mode', mode);
	setMetaThemeColor(effective);
};

const getInitialMode = () => {
	try {
		const saved = localStorage.getItem('themeMode');
		if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
		return 'system';
	} catch {
		return 'system';
	}
};

export const ThemeProvider = ({ children }) => {
	const [mode, setModeState] = useState(getInitialMode);
	const theme = getEffectiveTheme(mode);

	const setMode = useCallback((m) => {
		setModeState(m);
		try {
			localStorage.setItem('themeMode', m);
		} catch {}
		applyTheme(m);
	}, []);

	const toggleMode = useCallback(() => {
		setMode((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
	}, [setMode]);

	// Apply on mount and listen for system changes when in 'system' mode
	useEffect(() => {
		applyTheme(mode);
		const mql = window.matchMedia('(prefers-color-scheme: light)');
		const handler = () => {
			if (mode === 'system') applyTheme('system');
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	}, [mode]);

	const value = useMemo(
		() => ({ mode, theme, setMode, toggleMode }),
		[mode, theme, setMode, toggleMode]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
