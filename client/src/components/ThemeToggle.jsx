import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const SegButton = ({ active, onClick, label, children, size = 'sm' }) => (
	<button
		type="button"
		aria-pressed={active}
		onClick={onClick}
		className={`rounded-lg inline-flex items-center gap-1.5 transition-colors ${
			size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'
		} ${active ? 'bg-white/15 text-primary' : 'text-secondary hover:bg-white/10'}`}
	>
		{children}
		<span className="hidden sm:inline">{label}</span>
	</button>
);

const ThemeToggle = ({ variant = 'floating' }) => {
	const { mode, setMode } = useTheme();

	if (variant === 'inline') {
		return (
			<div
				className="flex items-center gap-1 rounded-xl"
				style={{
					background: 'var(--glass-bg)',
					border: '1px solid var(--glass-border)',
					padding: '4px',
				}}
				aria-label="Theme"
				role="group"
			>
				<SegButton
					active={mode === 'light'}
					onClick={() => setMode('light')}
					label="Light"
					size="sm"
				>
					<Sun className="w-4 h-4" />
				</SegButton>
				<SegButton
					active={mode === 'dark'}
					onClick={() => setMode('dark')}
					label="Dark"
					size="sm"
				>
					<Moon className="w-4 h-4" />
				</SegButton>
				<SegButton
					active={mode === 'system'}
					onClick={() => setMode('system')}
					label="Auto"
					size="sm"
				>
					<Laptop className="w-4 h-4" />
				</SegButton>
			</div>
		);
	}

	// Floating variant (for use outside the navbar if needed)
	return (
		<div
			className="fixed right-4 top-24 z-50 glass-card rounded-xl"
			aria-label="Theme"
			role="group"
		>
			<div className="flex items-center gap-1 p-1">
				<SegButton active={mode === 'light'} onClick={() => setMode('light')} label="Light">
					<Sun className="w-4 h-4" />
				</SegButton>
				<SegButton active={mode === 'dark'} onClick={() => setMode('dark')} label="Dark">
					<Moon className="w-4 h-4" />
				</SegButton>
				<SegButton
					active={mode === 'system'}
					onClick={() => setMode('system')}
					label="Auto"
				>
					<Laptop className="w-4 h-4" />
				</SegButton>
			</div>
		</div>
	);
};

export default ThemeToggle;
