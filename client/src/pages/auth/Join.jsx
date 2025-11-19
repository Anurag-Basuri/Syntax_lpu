import React, { useState, useEffect, useRef, useMemo } from 'react';
import { submitApplication } from '../../services/applyServices.js';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, BookOpen, Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import './join.css';

/* Small accessibility helper: keyboard toggle for domain chips */
const isToggleKey = (e) => e.key === ' ' || e.key === 'Enter' || e.code === 'Space';

const InputField = ({
	id,
	label,
	icon,
	type = 'text',
	name,
	placeholder,
	value,
	onChange,
	error,
	ariaLabel,
	inputMode,
	maxLength,
	autoFocus = false,
	inputRef = null,
}) => (
	<div className="relative w-full group">
		{icon && (
			<div className="icon-left" aria-hidden>
				{icon}
			</div>
		)}
		<label htmlFor={id} className="sr-only">
			{label}
		</label>
		<input
			id={id}
			ref={inputRef}
			aria-label={ariaLabel || name}
			type={type}
			name={name}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			inputMode={inputMode}
			maxLength={maxLength}
			className={`form-input ${error ? 'input-error' : ''}`}
			autoFocus={autoFocus}
		/>
		{error && (
			<p className="field-error" role="alert">
				<XCircle size={14} /> {error}
			</p>
		)}
	</div>
);

const TextAreaField = ({ id, name, placeholder, value, onChange, error, maxLength, remaining }) => (
	<div className="w-full group">
		<label htmlFor={id} className="sr-only">
			About you
		</label>
		<textarea
			id={id}
			aria-label={name}
			name={name}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			maxLength={maxLength}
			rows={5}
			className={`form-textarea ${error ? 'input-error' : ''}`}
		/>
		<div className="field-meta">
			{error && (
				<p className="field-error" role="alert">
					<XCircle size={14} /> {error}
				</p>
			)}
			{remaining !== undefined && (
				<p className={`char-remaining ${remaining < 50 ? 'warn' : ''}`}>
					{remaining} characters left
				</p>
			)}
		</div>
	</div>
);

const GradientButton = ({ children, isLoading, ...props }) => (
	<button
		type="submit"
		className={`btn-primary ${isLoading ? 'loading' : ''}`}
		disabled={isLoading}
		{...props}
	>
		{isLoading ? (
			<>
				<svg className="spinner" viewBox="0 0 24 24" fill="none" aria-hidden>
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
			</>
		) : (
			<>
				{children}
				<ArrowRight size={18} />
			</>
		)}
	</button>
);

const StepIndicator = ({ step, totalSteps, title }) => (
	<div className="step-indicator">
		<div className={`step-bubble ${step <= totalSteps ? 'active' : ''}`}>{step}</div>
		<h3 className="step-title">{title}</h3>
	</div>
);

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
	const hostelRef = useRef(null);
	const nameRef = useRef(null);
	const { theme } = useTheme();
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

	// autofocus first field for convenience
	useEffect(() => {
		try {
			nameRef.current?.focus();
		} catch (e) {}
	}, []);

	useEffect(() => {
		let t;
		if (successCountdown > 0) {
			t = setTimeout(() => setSuccessCountdown((c) => c - 1), 1000);
		} else if (successCountdown === 0 && serverMessage.type === 'success') {
			navigate('/login');
		}
		return () => clearTimeout(t);
	}, [successCountdown, serverMessage, navigate]);

	useEffect(() => {
		if (formData.accommodation === 'hostler' && hostelRef.current) {
			hostelRef.current.focus();
		}
	}, [formData.accommodation]);

	const BIO_MAX = 500;
	const bioRemaining = BIO_MAX - (formData.bio?.length || 0);

	// pure validator that returns errors object (doesn't set state)
	const validateNoSet = (data) => {
		const newErrors = {};
		if (!data.fullName.trim()) newErrors.fullName = 'Full name is required.';
		if (!/^\d{8}$/.test(data.LpuId.trim()))
			newErrors.LpuId = 'LPU ID must be exactly 8 digits.';
		if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'A valid email is required.';
		if (!data.phone.trim()) newErrors.phone = 'Phone number is required.';
		if (!data.course.trim()) newErrors.course = 'Your course is required.';
		if (!data.gender) newErrors.gender = 'Please select a gender.';
		if (!Array.isArray(data.domains) || data.domains.length === 0)
			newErrors.domains = 'Select at least one domain.';
		if (Array.isArray(data.domains) && data.domains.length > 2)
			newErrors.domains = 'You can select up to 2 domains.';
		if (!data.accommodation) newErrors.accommodation = 'Select accommodation preference.';
		if (data.accommodation === 'hostler' && !data.hostelName.trim())
			newErrors.hostelName = 'Hostel name required for hostlers.';
		if (!data.bio.trim()) newErrors.bio = 'A short bio is required.';
		return newErrors;
	};

	const isFormValid = useMemo(() => {
		const errs = validateNoSet(formData);
		return Object.keys(errs).length === 0;
	}, [formData]);

	const parseServerError = (err) => {
		const resp = err?.response?.data;
		if (!resp) return err?.message || 'Unknown error';
		// If server returns field-level errors as object { field: msg }
		if (resp.errors && typeof resp.errors === 'object') {
			return resp;
		}
		if (Array.isArray(resp.details) && resp.details.length) {
			return [resp.message, ...resp.details].join(' — ');
		}
		return resp.message || JSON.stringify(resp) || err.message || 'Request failed';
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (type === 'checkbox' && (name === 'previousExperience' || name === 'anyotherorg')) {
			setFormData((prev) => ({ ...prev, [name]: checked }));
			setErrors((prev) => ({ ...prev, [name]: '' }));
			return;
		}

		if (type === 'checkbox' && name === 'domains') {
			setFormData((prev) => {
				const next = new Set(prev.domains || []);
				if (checked) {
					if (next.size >= 2) {
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
				setErrors((prevErr) => ({
					...prevErr,
					domains: next.size <= 2 ? '' : prevErr.domains,
				}));
				return { ...prev, domains: Array.from(next) };
			});
			return;
		}

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

	// toggle domain by key (used for keyboard accessible chips)
	const toggleDomain = (key) => {
		setFormData((prev) => {
			const next = new Set(prev.domains || []);
			if (next.has(key)) next.delete(key);
			else {
				if (next.size >= 2) {
					setErrors((p) => ({ ...p, domains: 'You can select up to 2 domains only.' }));
					return prev;
				}
				next.add(key);
			}
			setErrors((p) => ({ ...p, domains: '' }));
			return { ...prev, domains: Array.from(next) };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// evaluate and set errors if any
		const newErrors = validateNoSet(formData);
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			// focus first error field
			const first = Object.keys(newErrors)[0];
			const el = document.querySelector(`[name="${first}"]`);
			if (el) el.focus();
			return;
		}

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
			setFormData({
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
			setErrors({});
		} catch (err) {
			const parsed = parseServerError(err);
			// If server returned field-level errors object, apply them
			if (parsed && parsed.errors && typeof parsed.errors === 'object') {
				setErrors((prev) => ({ ...prev, ...parsed.errors }));
				setServerMessage({
					type: 'error',
					text: parsed.message || 'Please fix the highlighted fields.',
				});
			} else if (typeof parsed === 'string') {
				setServerMessage({ type: 'error', text: parsed });
			} else {
				setServerMessage({ type: 'error', text: 'Submission failed. Try again.' });
			}
		} finally {
			setLoading(false);
		}
	};

	const domainsSelectedCount = formData.domains.length;
	const disableMoreDomains = domainsSelectedCount >= 2;

	return (
		<div className="join-page" data-theme={theme}>
			<div className="join-shell">
				<aside className="join-info" aria-hidden>
					<h2 className="join-title">Become a Syntax Builder</h2>
					<p className="join-sub">
						Apply to join our club — pick up to 2 domains and tell us about you.
					</p>

					<ul className="benefits" aria-hidden>
						<li>Hands-on workshops & hackathons</li>
						<li>Mentorship, projects & internships</li>
						<li>Priority tickets & resource access</li>
					</ul>

					<div className="join-cta">
						<p className="muted">Already a member?</p>
						<button className="btn-ghost small" onClick={() => navigate('/login')}>
							Login
						</button>
					</div>
				</aside>

				<main className="join-card" role="main" aria-labelledby="join-heading">
					<header className="join-header">
						<h1 id="join-heading">Application — Syntax Club</h1>
						<p className="muted">Complete this form to apply for membership.</p>
					</header>

					{serverMessage.text && (
						<div
							className={`server-msg ${serverMessage.type}`}
							role="status"
							aria-live="polite"
						>
							{serverMessage.type === 'success' ? (
								<CheckCircle size={18} />
							) : (
								<XCircle size={18} />
							)}
							<span>{serverMessage.text}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="join-form" noValidate>
						{/* Personal */}
						<div className="section">
							<StepIndicator step={1} totalSteps={4} title="Personal Information" />
							<div className="grid cols-2">
								<InputField
									id="fullName"
									label="Full name"
									icon={<User size={18} />}
									name="fullName"
									placeholder="Full name"
									value={formData.fullName}
									onChange={handleChange}
									error={errors.fullName}
									inputRef={nameRef}
									autoFocus
								/>
								<InputField
									id="email"
									label="Email"
									icon={<Mail size={18} />}
									type="email"
									name="email"
									placeholder="Email address"
									value={formData.email}
									onChange={handleChange}
									error={errors.email}
								/>
							</div>
						</div>

						{/* Academic */}
						<div className="section">
							<StepIndicator step={2} totalSteps={4} title="Academic Details" />
							<div className="grid cols-2">
								<InputField
									id="LpuId"
									label="LPU ID"
									icon={<User size={18} />}
									name="LpuId"
									placeholder="LPU ID (8 digits)"
									value={formData.LpuId}
									onChange={handleChange}
									error={errors.LpuId}
									ariaLabel="LPU ID"
									inputMode="numeric"
								/>
								<InputField
									id="course"
									label="Course"
									icon={<BookOpen size={18} />}
									name="course"
									placeholder="Course (e.g., B.Tech CSE)"
									value={formData.course}
									onChange={handleChange}
									error={errors.course}
								/>
								<InputField
									id="phone"
									label="Phone"
									icon={<Phone size={18} />}
									type="tel"
									name="phone"
									placeholder="Phone number"
									value={formData.phone}
									onChange={handleChange}
									error={errors.phone}
								/>
								<div className="relative w-full">
									<label htmlFor="gender" className="sr-only">
										Gender
									</label>
									<div className="icon-left" aria-hidden>
										<Users size={18} />
									</div>
									<select
										id="gender"
										aria-label="gender"
										name="gender"
										value={formData.gender}
										onChange={handleChange}
										className={`form-input ${
											errors.gender ? 'input-error' : ''
										}`}
									>
										<option value="" disabled>
											Select gender
										</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
									{errors.gender && (
										<p className="field-error">
											<XCircle size={14} /> {errors.gender}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Preferences */}
						<div className="section">
							<StepIndicator step={3} totalSteps={4} title="Preferences & Domains" />
							<div className="grid cols-2 gap">
								<div>
									<label className="label">
										Select domains{' '}
										<span className="muted">({domainsSelectedCount}/2)</span>
									</label>
									<div
										className="domains-grid"
										role="group"
										aria-label="Preferred domains"
									>
										{DOMAIN_OPTIONS.map((opt) => {
											const checked = formData.domains.includes(opt.key);
											const disabled = !checked && disableMoreDomains;
											return (
												<button
													key={opt.key}
													type="button"
													role="checkbox"
													aria-checked={checked}
													className={`domain-chip ${
														checked ? 'checked' : ''
													} ${disabled ? 'disabled' : ''}`}
													onClick={() => toggleDomain(opt.key)}
													onKeyDown={(e) => {
														if (isToggleKey(e)) {
															e.preventDefault();
															toggleDomain(opt.key);
														}
													}}
													disabled={disabled}
												>
													<input
														type="checkbox"
														name="domains"
														value={opt.key}
														checked={checked}
														readOnly
														tabIndex={-1}
													/>
													<span>{opt.label}</span>
												</button>
											);
										})}
									</div>
									{errors.domains && (
										<p className="field-error">
											<XCircle size={14} /> {errors.domains}
										</p>
									)}
								</div>

								<div className="space-y">
									<label className="label">Accommodation</label>
									<select
										name="accommodation"
										value={formData.accommodation}
										onChange={handleChange}
										className={`form-input ${
											errors.accommodation ? 'input-error' : ''
										}`}
									>
										<option value="" disabled>
											Select accommodation
										</option>
										<option value="hostler">Hostler</option>
										<option value="non-hostler">Non-Hostler</option>
									</select>
									{errors.accommodation && (
										<p className="field-error">
											<XCircle size={14} /> {errors.accommodation}
										</p>
									)}

									{formData.accommodation === 'hostler' && (
										<div>
											<input
												id="hostelName"
												name="hostelName"
												ref={hostelRef}
												placeholder="Hostel name"
												value={formData.hostelName}
												onChange={handleChange}
												className={`form-input ${
													errors.hostelName ? 'input-error' : ''
												}`}
											/>
											{errors.hostelName && (
												<p className="field-error">
													<XCircle size={14} /> {errors.hostelName}
												</p>
											)}
										</div>
									)}

									<div className="checkboxes">
										<label className="checkbox">
											<input
												type="checkbox"
												name="previousExperience"
												checked={formData.previousExperience}
												onChange={handleChange}
											/>
											<span>Previous experience</span>
										</label>
										<label className="checkbox">
											<input
												type="checkbox"
												name="anyotherorg"
												checked={formData.anyotherorg}
												onChange={handleChange}
											/>
											<span>Associated with other org</span>
										</label>
									</div>
								</div>
							</div>
						</div>

						{/* About */}
						<div className="section">
							<StepIndicator step={4} totalSteps={4} title="About You" />
							<TextAreaField
								id="bio"
								name="bio"
								placeholder="A short bio about your interests and skills"
								value={formData.bio}
								onChange={(e) => {
									if (e.target.value.length > BIO_MAX) return;
									handleChange(e);
								}}
								error={errors.bio}
								maxLength={BIO_MAX}
								remaining={bioRemaining}
							/>
						</div>

						<div className="form-actions">
							{/* disable submit if invalid or loading; show review-first option on mobile if preferred */}
							<GradientButton isLoading={loading} disabled={loading || !isFormValid}>
								Submit Application
							</GradientButton>
						</div>
					</form>

					<footer className="join-footer">
						Already a member?{' '}
						<button onClick={() => navigate('/login')} className="link-cta">
							Login
						</button>
					</footer>
				</main>
			</div>
		</div>
	);
};

export default JoinPage;
