import React, { useState, useEffect, useRef } from 'react';
import { submitApplication } from '../../services/applyServices.js';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, BookOpen, Users } from 'lucide-react';

/* --- Small presentational bits kept local for this page --- */
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
	<div className="relative w-full">
		{icon && (
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
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
			className={`auth-input pl-12 ${error ? 'border-red-500/50' : ''}`}
		/>
		{error && (
			<p className="mt-1.5 text-sm text-red-400" role="alert">
				{error}
			</p>
		)}
	</div>
);

const TextAreaField = ({ name, placeholder, value, onChange, error }) => (
	<div className="w-full">
		<textarea
			aria-label={name}
			name={name}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			rows={5}
			className={`auth-input resize-y ${error ? 'border-red-500/50' : ''}`}
		/>
		{error && (
			<p className="mt-1.5 text-sm text-red-400" role="alert">
				{error}
			</p>
		)}
	</div>
);

const GradientButton = ({ children, isLoading, ...props }) => (
	<button
		type="submit"
		className={`auth-button group flex items-center justify-center gap-3 ${
			isLoading ? 'opacity-80 cursor-wait' : ''
		}`}
		disabled={isLoading}
		{...props}
	>
		{isLoading ? (
			<span className="flex items-center gap-2">
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
				<span>Submitting...</span>
			</span>
		) : (
			children
		)}
	</button>
);

/* --- Domain options (expanded) --- */
const DOMAIN_OPTIONS = [
	{ key: 'development', label: 'Development' },
	{ key: 'design', label: 'Design' },
	{ key: 'marketing', label: 'Marketing' },
	{ key: 'content', label: 'Content' },
	{ key: 'events', label: 'Events' },
	{ key: 'ai', label: 'AI/ML' },
	{ key: 'devops', label: 'DevOps' },
	{ key: 'uiux', label: 'UI/UX' },
	{ key: 'graphics', label: 'Graphics' },
	{ key: 'qa', label: 'Quality Assurance' },
];

const JoinPage = () => {
	const navigate = useNavigate();
	const hostelRef = useRef(null); // autofocus hostel input when needed
	const [formData, setFormData] = useState({
		fullName: '',
		LpuId: '',
		email: '',
		phone: '',
		course: '',
		gender: '',
		domains: [],
		accommodation: '',
		hostelName: '',
		previousExperience: false,
		anyotherorg: false,
		bio: '',
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
	const [successCountdown, setSuccessCountdown] = useState(0);

	useEffect(() => {
		let t;
		if (successCountdown > 0) {
			t = setTimeout(() => setSuccessCountdown((c) => c - 1), 1000);
		} else if (successCountdown === 0 && serverMessage.type === 'success') {
			// redirect after countdown ends
			navigate('/login');
		}
		return () => clearTimeout(t);
	}, [successCountdown, serverMessage, navigate]);

	useEffect(() => {
		// Focus hostel name when accommodation becomes hostler
		if (formData.accommodation === 'hostler' && hostelRef.current) {
			hostelRef.current.focus();
		}
	}, [formData.accommodation]);

	// bio length handling
	const BIO_MAX = 500;
	const bioRemaining = BIO_MAX - (formData.bio?.length || 0);

	const validate = () => {
		const newErrors = {};
		if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
		// server expects exact 8 digits
		if (!/^\d{8}$/.test(formData.LpuId.trim()))
			newErrors.LpuId = 'LPU ID must be exactly 8 digits.';
		if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'A valid email is required.';
		if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
		if (!formData.course.trim()) newErrors.course = 'Your course is required.';
		if (!formData.gender) newErrors.gender = 'Please select a gender.';
		if (!Array.isArray(formData.domains) || formData.domains.length === 0)
			newErrors.domains = 'Select at least one domain.';
		if (Array.isArray(formData.domains) && formData.domains.length > 2)
			newErrors.domains = 'You can select up to 2 domains.';
		if (!formData.accommodation) newErrors.accommodation = 'Select accommodation preference.';
		// hostelName required when hostler
		if (formData.accommodation === 'hostler' && !formData.hostelName.trim())
			newErrors.hostelName = 'Hostel name required for hostlers.';
		if (!formData.bio.trim()) newErrors.bio = 'A short bio is required.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const parseServerError = (err) => {
		const resp = err?.response?.data;
		if (!resp) return err?.message || 'Unknown error';
		// server may send { message, details }
		if (Array.isArray(resp.details) && resp.details.length) {
			return [resp.message, ...resp.details].join(' — ');
		}
		return resp.message || JSON.stringify(resp) || err.message || 'Request failed';
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// boolean toggles
		if (type === 'checkbox' && (name === 'previousExperience' || name === 'anyotherorg')) {
			setFormData((prev) => ({ ...prev, [name]: checked }));
			setErrors((prev) => ({ ...prev, [name]: '' }));
			return;
		}

		// domain checkboxes: enforce max 2 and disable other checkboxes when 2 selected
		if (type === 'checkbox' && name === 'domains') {
			setFormData((prev) => {
				const next = new Set(prev.domains || []);
				if (checked) {
					if (next.size >= 2) {
						// show gentle inline hint
						setErrors((prevErr) => ({
							...prevErr,
							domains: 'You can select up to 2 domains only.',
						}));
						return prev;
					}
					next.add(value);
				} else {
					next.delete(value);
				}
				// clear domains error when changed appropriately
				setErrors((prevErr) => ({
					...prevErr,
					domains: next.size <= 2 ? '' : prevErr.domains,
				}));
				return { ...prev, domains: Array.from(next) };
			});
			return;
		}

		// numeric-only LPU input: strip non-digits
		if (name === 'LpuId') {
			const digits = value.replace(/\D/g, '').slice(0, 8);
			setFormData((prev) => ({ ...prev, LpuId: digits }));
			if (errors.LpuId) setErrors((prev) => ({ ...prev, LpuId: '' }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
		if (serverMessage.text) setServerMessage({ type: '', text: '' });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		setServerMessage({ type: '', text: '' });

		const payload = {
			fullName: formData.fullName.trim(),
			LpuId: formData.LpuId.trim(),
			email: formData.email.trim(),
			phone: formData.phone.trim(),
			course: formData.course.trim(),
			gender: formData.gender,
			domains: formData.domains,
			accommodation: formData.accommodation,
			hostelName: formData.hostelName?.trim() || '',
			previousExperience: !!formData.previousExperience,
			anyotherorg: !!formData.anyotherorg,
			bio: formData.bio.trim(),
		};

		try {
			await submitApplication(payload);
			setServerMessage({
				type: 'success',
				text: 'Application submitted — redirecting to login in 3s.',
			});
			setSuccessCountdown(3);
			// clear form
			setFormData((prev) => ({
				...prev,
				fullName: '',
				LpuId: '',
				email: '',
				phone: '',
				course: '',
				gender: '',
				domains: [],
				accommodation: '',
				hostelName: '',
				previousExperience: false,
				anyotherorg: false,
				bio: '',
			}));
			setErrors({});
		} catch (err) {
			setServerMessage({ type: 'error', text: parseServerError(err) });
		} finally {
			setLoading(false);
		}
	};

	/* helper: whether domain checkboxes should be disabled when 2 selected */
	const domainsSelectedCount = formData.domains.length;
	const disableMoreDomains = domainsSelectedCount >= 2;

	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="auth-card">
				<header className="text-center mb-4">
					<h1 className="text-3xl font-bold text-primary">Become a Syntax Builder</h1>
					<p className="mt-2 text-secondary">
						Join a community of creators, innovators and developers. (Select up to 2
						domains)
					</p>
				</header>

				{serverMessage.text && (
					<div
						className={`mt-4 text-center p-3 rounded-lg border ${
							serverMessage.type === 'success'
								? 'text-emerald-400 bg-emerald-500/6 border-emerald-500/12'
								: 'text-rose-400 bg-rose-500/6 border-rose-500/12'
						}`}
						role="status"
					>
						{serverMessage.text}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 grid gap-6" noValidate>
					{/* Personal */}
					<fieldset className="auth-fieldset">
						<legend className="auth-legend">
							<span className="auth-legend-step">1</span> Personal
						</legend>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InputField
								icon={<User size={18} />}
								name="fullName"
								placeholder="Full name"
								value={formData.fullName}
								onChange={handleChange}
								error={errors.fullName}
							/>
							<InputField
								icon={<Mail size={18} />}
								type="email"
								name="email"
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
								error={errors.email}
							/>
						</div>
					</fieldset>

					{/* Academic */}
					<fieldset className="auth-fieldset">
						<legend className="auth-legend">
							<span className="auth-legend-step">2</span> Academic
						</legend>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<InputField
								icon={<User size={18} />}
								name="LpuId"
								placeholder="LPU ID (8 digits)"
								value={formData.LpuId}
								onChange={handleChange}
								error={errors.LpuId}
								ariaLabel="LPU ID"
							/>
							<InputField
								icon={<BookOpen size={18} />}
								name="course"
								placeholder="Course (e.g., B.Tech CSE)"
								value={formData.course}
								onChange={handleChange}
								error={errors.course}
							/>
							<InputField
								icon={<Phone size={18} />}
								type="tel"
								name="phone"
								placeholder="Phone number"
								value={formData.phone}
								onChange={handleChange}
								error={errors.phone}
							/>
							<div className="relative w-full">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
									<Users size={18} />
								</div>
								<select
									aria-label="gender"
									name="gender"
									value={formData.gender}
									onChange={handleChange}
									className={`auth-input pl-12 ${
										errors.gender ? 'border-red-500/50' : ''
									}`}
								>
									<option value="" disabled>
										Select gender
									</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
								</select>
								{errors.gender && (
									<p className="mt-1.5 text-sm text-red-400" role="alert">
										{errors.gender}
									</p>
								)}
							</div>
						</div>
					</fieldset>

					{/* Preferences */}
					<fieldset className="auth-fieldset">
						<legend className="auth-legend">
							<span className="auth-legend-step">3</span> Preferences & Domains
						</legend>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Select domains{' '}
									<span className="text-xs text-gray-400">
										({domainsSelectedCount}/2)
									</span>
								</label>
								<div className="grid grid-cols-2 gap-2">
									{DOMAIN_OPTIONS.map((opt) => {
										const checked = formData.domains.includes(opt.key);
										const disabled = !checked && disableMoreDomains;
										return (
											<label
												key={opt.key}
												className={`inline-flex items-center gap-2 cursor-pointer ${
													disabled ? 'opacity-60 cursor-not-allowed' : ''
												}`}
											>
												<input
													type="checkbox"
													name="domains"
													value={opt.key}
													checked={checked}
													onChange={handleChange}
													disabled={disabled}
													className="form-checkbox"
													aria-checked={checked}
												/>
												<span className="text-sm text-gray-200">
													{opt.label}
												</span>
											</label>
										);
									})}
								</div>
								{errors.domains ? (
									<p className="mt-1.5 text-sm text-red-400">{errors.domains}</p>
								) : (
									<p className="mt-1 text-xs text-gray-400">
										Pick 1 or 2 domains that best match your interests.
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Accommodation
								</label>
								<select
									name="accommodation"
									value={formData.accommodation}
									onChange={handleChange}
									className={`auth-input ${
										errors.accommodation ? 'border-red-500/50' : ''
									}`}
								>
									<option value="" disabled>
										Select accommodation
									</option>
									<option value="hostler">Hostler</option>
									<option value="non-hostler">Non-Hostler</option>
								</select>
								{errors.accommodation && (
									<p className="mt-1.5 text-sm text-red-400">
										{errors.accommodation}
									</p>
								)}

								{/* show hostel name if hostler */}
								{formData.accommodation === 'hostler' && (
									<div className="mt-3">
										<input
											name="hostelName"
											ref={hostelRef}
											placeholder="Hostel name"
											value={formData.hostelName}
											onChange={handleChange}
											className={`auth-input ${
												errors.hostelName ? 'border-red-500/50' : ''
											}`}
										/>
										{errors.hostelName && (
											<p className="mt-1.5 text-sm text-red-400">
												{errors.hostelName}
											</p>
										)}
										<p className="mt-1 text-xs text-gray-400">
											Please enter the name of your hostel.
										</p>
									</div>
								)}

								<div className="mt-4 space-y-2">
									<label className="inline-flex items-center gap-2">
										<input
											type="checkbox"
											name="previousExperience"
											checked={formData.previousExperience}
											onChange={handleChange}
											className="form-checkbox"
										/>
										<span className="text-sm text-gray-200">
											Previous experience
										</span>
									</label>
									<label className="inline-flex items-center gap-2">
										<input
											type="checkbox"
											name="anyotherorg"
											checked={formData.anyotherorg}
											onChange={handleChange}
											className="form-checkbox"
										/>
										<span className="text-sm text-gray-200">
											Associated with other org
										</span>
									</label>
								</div>
							</div>
						</div>
					</fieldset>

					{/* About */}
					<fieldset className="auth-fieldset">
						<legend className="auth-legend">
							<span className="auth-legend-step">4</span> About you
						</legend>
						<TextAreaField
							name="bio"
							placeholder="A short bio about your interests and skills (max 500 chars)"
							value={formData.bio}
							onChange={(e) => {
								// prevent typing beyond limit
								if (e.target.value.length > BIO_MAX) return;
								handleChange(e);
							}}
							error={errors.bio}
						/>
						<div className="flex justify-end text-xs text-gray-400 mt-1">
							{bioRemaining} characters left
						</div>
					</fieldset>

					<div className="flex justify-end">
						<GradientButton isLoading={loading}>Submit application</GradientButton>
					</div>
				</form>

				<footer className="mt-6 text-center text-sm text-secondary">
					Already a member?{' '}
					<button
						onClick={() => navigate('/login')}
						className="font-semibold text-accent-1 hover:underline"
					>
						Login
					</button>
				</footer>
			</div>
		</div>
	);
};

export default JoinPage;
