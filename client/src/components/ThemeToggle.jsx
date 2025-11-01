import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const ThemeToggle = ({ size = 'sm' }) => {
	const { mode, setMode } = useTheme();
	const [pillStyle, setPillStyle] = useState({ transform: 'translateX(0)', width: 0 });
	const containerRef = useRef(null);
	const btnRefs = useRef([]);

	// Initialize if mode is 'system' or unknown -> respect device preference once
	useEffect(() => {
		if (mode !== 'light' && mode !== 'dark') {
			const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
			setMode(prefersDark ? 'dark' : 'light');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Position the sliding pill over the active option
	const updatePill = () => {
		const activeIndex = mode === 'dark' ? 1 : 0;
		const activeBtn = btnRefs.current[activeIndex];
		const container = containerRef.current;
		if (!activeBtn || !container) return;
		const c = container.getBoundingClientRect();
		const b = activeBtn.getBoundingClientRect();
		setPillStyle({
			width: b.width,
			transform: `translateX(${b.left - c.left}px)`,
		});
	};

	useEffect(() => {
		updatePill();
		window.addEventListener('resize', updatePill, { passive: true });
		return () => window.removeEventListener('resize', updatePill);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	const btnClass =
		size === 'sm'
			? 'h-8 min-w-[2.25rem] px-2 text-[11px]'
			: 'h-9 min-w-[2.6rem] px-2.5 text-[13px]';

	return (
		<div ref={containerRef} className="theme-toggle" role="group" aria-label="Theme toggle">
			{/* Sliding pill */}
			<div aria-hidden="true" className="theme-toggle__pill" style={pillStyle} />

			{/* Light */}
			<button
				ref={(el) => (btnRefs.current[0] = el)}
				type="button"
				className={`theme-toggle__btn ${btnClass} ${mode === 'light' ? 'active' : ''}`}
				aria-pressed={mode === 'light'}
				aria-label="Light mode"
				onClick={() => setMode('light')}
			>
				<Sun className="theme-toggle__icon w-[18px] h-[18px]" />
			</button>

			{/* Dark */}
			<button
				ref={(el) => (btnRefs.current[1] = el)}
				type="button"
				className={`theme-toggle__btn ${btnClass} ${mode === 'dark' ? 'active' : ''}`}
				aria-pressed={mode === 'dark'}
				aria-label="Dark mode"
				onClick={() => setMode('dark')}
			>
				<Moon className="theme-toggle__icon w-[18px] h-[18px]" />
			</button>
		</div>
	);
};

export default ThemeToggle;
