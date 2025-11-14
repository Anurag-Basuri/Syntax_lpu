import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Reusable, lightweight form components
const InputField = ({
	icon,
	type = 'text',
	name,
	placeholder,
	value,
	onChange,
	error,
	ariaLabel,
}) => (
	<div className="relative w-full group">
		{icon && (
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-purple-400 transition-colors">
				{icon}
			</div>
		)}
		<input
			aria-label={ariaLabel || name}
			type={type}
			name={name}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			className={`w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
				error ? 'border-red-500/50 focus:ring-red-500/50' : ''
			}`}
		/>
		{error && (
			<p className="mt-2 text-sm text-red-400 flex items-center gap-1" role="alert">
				<XCircle size={14} /> {error}
			</p>
		)}
	</div>
);

const GradientButton = ({ children, isLoading, ...props }) => (
	<button
		type="submit"
		className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 ${
			isLoading ? 'opacity-75 cursor-not-allowed' : ''
		}`}
		disabled={isLoading}
		{...props}
	>
		{isLoading ? (
			<>
				<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="3"
						className="opacity-25"
					/>
					<path
						d="M4 12a8 8 0 018-8"
						stroke="currentColor"
						strokeWidth="3"
						className="opacity-75"
					/>
				</svg>
				<span>Authenticating...</span>
			</>
		) : (
			<>
				{children}
				<ArrowRight size={18} />
			</>
		)}
	</button>
);

const LoginPage = () => {
	const navigate = useNavigate();
	const { loginMember } = useAuth();
	const [loginData, setLoginData] = useState({
		identifier: '',
		password: '',
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const validate = () => {
		const newErrors = {};
		if (!loginData.identifier) newErrors.identifier = 'LPU ID or email is required.';
		if (!loginData.password) newErrors.password = 'Password is required.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setLoginData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
		if (serverError) setServerError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		setServerError('');
		try {
			await loginMember(loginData);
			navigate('/member/dashboard', { replace: true });
		} catch (err) {
			setServerError(
				err?.response?.data?.message || 'Invalid credentials. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#1e1b4b] flex justify-center p-4">
			<div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 mt-8">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
						Welcome Back, Builder
					</h1>
					<p className="mt-3 text-gray-300 text-lg">
						Log in to access your dashboard and projects.
					</p>
				</header>

				{serverError && (
					<div
						className="mb-6 p-4 rounded-xl border flex items-center gap-3 text-red-400 bg-red-500/10 border-red-500/20"
						role="status"
					>
						<XCircle size={20} />
						<span>{serverError}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6" noValidate>
					<InputField
						icon={<User size={18} />}
						type="text"
						name="identifier"
						placeholder="LPU ID or Email"
						value={loginData.identifier}
						onChange={handleChange}
						error={errors.identifier}
					/>
					<div>
						<div className="relative w-full">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
								<Lock size={18} />
							</div>
							<input
								aria-label="password"
								type={showPassword ? 'text' : 'password'}
								name="password"
								placeholder="Password"
								value={loginData.password}
								onChange={handleChange}
								className={`w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
									errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''
								}`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-3.5 text-gray-400 hover:text-purple-400 transition-colors"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
						{errors.password && (
							<p
								className="mt-2 text-sm text-red-400 flex items-center gap-1"
								role="alert"
							>
								<XCircle size={14} /> {errors.password}
							</p>
						)}
						<div className="text-right mt-2">
							<button
								type="button"
								className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
							>
								Forgot Password?
							</button>
						</div>
					</div>
					<div className="flex justify-end pt-4">
						<GradientButton isLoading={loading}>Login</GradientButton>
					</div>
				</form>

				<footer className="mt-8 text-center text-sm text-gray-400">
					Don't have an account?{' '}
					<button
						onClick={() => navigate('/join')}
						className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
					>
						Join the Club
					</button>
				</footer>
			</div>
		</div>
	);
};

export default LoginPage;
