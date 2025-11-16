import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Mail,
	Send,
	CheckCircle2,
	Phone,
	AtSign,
	Loader2,
	AlertCircle,
	X,
} from 'lucide-react';
import { sendContactMessage } from '../services/contactServices.js';
import { toast } from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme.js';

/**
 * ContactPage (improved)
 *
 * - Public form where anyone can send a message.
 * - Better UX: inline validation, error mapping, honeypot, cooldown post-submit, improved accessibility.
 * - Backend handles persistence/validation; client maps server errors to fields when provided.
 */

const ContactPage = () => {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
		website: '', // honeypot, should remain empty
	});
	const [touched, setTouched] = useState({});
	const [fieldErrors, setFieldErrors] = useState({});
	const [serverError, setServerError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const cooldownRef = useRef(null);
	const firstInputRef = useRef(null);

	// Focus first field on mount
	useEffect(() => {
		firstInputRef.current?.focus();
	}, []);

	// Clean up cooldown timer
	useEffect(() => {
		return () => {
			if (cooldownRef.current) clearInterval(cooldownRef.current);
		};
	}, []);

	// Styling helpers
	const panelCls = isDark
		? 'rounded-3xl p-8 md:p-10 backdrop-blur-md bg-gradient-to-br from-slate-900/60 to-slate-800/50 border border-white/6 text-white shadow-2xl'
		: 'rounded-3xl p-8 md:p-10 backdrop-blur-md bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/40 text-slate-900 shadow-lg';

	const accentGradient = 'bg-[linear-gradient(90deg,#06b6d4,#3b82f6)]';

	/* ----------------------
	   Helpers
	   ---------------------- */

	// Normalize phone: keep last 10 digits, drop international prefix if present
	const normalizePhone = (raw) => {
		if (!raw) return null;
		const digits = String(raw).replace(/\D/g, '');
		if (!digits) return null;
		let d = digits.replace(/^0+/, '');
		if (d.length > 10 && d.startsWith('91')) d = d.slice(2);
		if (d.length >= 10) return d.slice(-10);
		return null;
	};

	const validators = {
		name: (v) => (v.trim() ? null : 'Please enter your full name.'),
		email: (v) =>
			!v.trim()
				? 'Please enter your email.'
				: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
				? null
				: 'Enter a valid email address.',
		phone: (v) =>
			!v.trim()
				? 'Please enter your phone number.'
				: normalizePhone(v)
				? null
				: 'Enter a valid 10-digit mobile number.',
		subject: (v) => (v.trim() ? null : 'Please add a short subject.'),
		message: (v) =>
			!v.trim()
				? 'Please enter a message.'
				: v.trim().length < 10
				? 'Message must be at least 10 characters.'
				: null,
		website: (v) => (v ? 'Bot detected' : null), // honeypot
	};

	const validateField = (name, value) => {
		const fn = validators[name];
		return fn ? fn(value) : null;
	};

	const validateAll = (data) => {
		const errors = {};
		for (const k of Object.keys(validators)) {
			const err = validateField(k, data[k]);
			if (err) errors[k] = err;
		}
		return Object.keys(errors).length ? errors : null;
	};

	/* ----------------------
	   Handlers
	   ---------------------- */

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((s) => ({ ...s, [name]: value }));
		// clear server error on input
		setServerError('');
		// revalidate this field if previously touched
		if (touched[name]) {
			const err = validateField(name, value);
			setFieldErrors((prev) => {
				const next = { ...prev };
				if (err) next[name] = err;
				else delete next[name];
				return next;
			});
		}
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		setTouched((s) => ({ ...s, [name]: true }));
		const err = validateField(name, value);
		setFieldErrors((prev) => {
			const next = { ...prev };
			if (err) next[name] = err;
			else delete next[name];
			return next;
		});
	};

	const startCooldown = (seconds = 30) => {
		setCooldown(seconds);
		if (cooldownRef.current) clearInterval(cooldownRef.current);
		cooldownRef.current = setInterval(() => {
			setCooldown((c) => {
				if (c <= 1) {
					clearInterval(cooldownRef.current);
					cooldownRef.current = null;
					return 0;
				}
				return c - 1;
			});
		}, 1000);
	};

	const mapServerErrors = (errPayload) => {
		// Common shapes:
		// - { errors: [{ field: 'email', message: 'Invalid' }, ...] }
		// - { errors: { email: 'Invalid', message: '...' } }
		// - { message: '...' }
		const nextFieldErrors = {};
		if (!errPayload) return nextFieldErrors;

		if (Array.isArray(errPayload.errors)) {
			for (const it of errPayload.errors) {
				if (it.field) nextFieldErrors[it.field] = it.message || it.msg || it.error || String(it);
			}
		} else if (typeof errPayload.errors === 'object' && errPayload.errors !== null) {
			for (const [k, v] of Object.entries(errPayload.errors)) {
				nextFieldErrors[k] = typeof v === 'string' ? v : v?.message ?? JSON.stringify(v);
			}
		} else if (errPayload.field && errPayload.message) {
			nextFieldErrors[errPayload.field] = errPayload.message;
		}

		return nextFieldErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Early exit: honeypot filled -> treat as bot
		if (formData.website) {
			toast.error('Invalid submission');
			return;
		}

		const allErrors = validateAll(formData);
		if (allErrors) {
			setFieldErrors(allErrors);
			// Focus first invalid field
			const first = Object.keys(allErrors)[0];
			document.querySelector(`[name="${first}"]`)?.focus();
			return toast.error('Please fix the highlighted fields.');
		}

		// Final normalized payload
		const payload = {
			name: formData.name.trim(),
			email: formData.email.trim(),
			phone: normalizePhone(formData.phone),
			subject: formData.subject.trim(),
			message: formData.message.trim(),
		};

		setIsSubmitting(true);
		setServerError('');
		setFieldErrors({});

		try {
			await sendContactMessage(payload);
			setSuccess(true);
			toast.success('Message sent — thank you!');
			// keep a copy of the submitted name/email for thank-you text if desired
			setFormData({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
			startCooldown(30);
			// revert success after some time if you prefer
			setTimeout(() => setSuccess(false), 7000);
		} catch (err) {
			// Parse server errors safely
			const resp = err?.response?.data ?? null;
			const msg = resp?.message || err?.message || 'Failed to send message';
			// Attempt to map validation errors
			const mapped = mapServerErrors(resp);
			if (Object.keys(mapped).length) {
				setFieldErrors(mapped);
				// focus first server-field error
				const first = Object.keys(mapped)[0];
				document.querySelector(`[name="${first}"]`)?.focus();
				toast.error('Please check the highlighted fields.');
			} else {
				setServerError(msg);
				toast.error(msg);
			}
			console.error('Contact submit error', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const isFormDisabled = isSubmitting || cooldown > 0;
	const hasErrors = Object.keys(fieldErrors).length > 0;

	return (
		<div className="min-h-screen section-padding">
			<div className="max-w-6xl mx-auto">
				<div className={panelCls}>
					<div className="grid md:grid-cols-5 gap-6 items-start">
						{/* Left: Info */}
						<aside className="md:col-span-2 flex flex-col gap-6">
							<div className="flex items-start gap-4">
								<div
									className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl"
									style={{
										background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
									}}
								>
									<Mail className="w-8 h-8 text-white" />
								</div>
								<div>
									<h1 className="text-3xl font-extrabold leading-tight">Get in touch</h1>
									<p className="mt-2 text-sm text-slate-400">
										We’re here to help — send a message and our team will respond within 48–72 hours.
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(2,6,23,0.03)' }}>
										<Phone className="w-5 h-5" />
									</div>
									<div>
										<h4 className="font-semibold">Phone</h4>
										<p className="text-sm text-slate-400">+91 93349 86732 (Mon–Fri, 9am–6pm)</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(2,6,23,0.03)' }}>
										<AtSign className="w-5 h-5" />
									</div>
									<div>
										<h4 className="font-semibold">Email</h4>
										<p className="text-sm text-slate-400">syntax.studorg@gmail.com</p>
									</div>
								</div>

								<div className="mt-4 text-xs text-slate-400">
									<strong>Privacy</strong> — we only use your details to respond to your enquiry. By sending a message you agree to our{' '}
									<a className="underline" href="/policies/privacy">privacy policy</a>.
								</div>
							</div>
						</aside>

						{/* Right: Form */}
						<main className="md:col-span-3">
							{/* Success Message */}
							<AnimatePresence>
								{success && (
									<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(12,185,122,0.07)' }} role="status" aria-live="polite">
										<CheckCircle2 className="text-emerald-400 w-5 h-5" />
										<div className="text-sm font-medium text-emerald-400">Thanks — your message was sent. We'll reply within 48–72 hours.</div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Server error (non-field) */}
							{serverError && (
								<div role="alert" className="mb-4 p-3 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--text-danger)' }}>
									<AlertCircle className="w-5 h-5" />
									<div className="text-sm">{serverError}</div>
								</div>
							)}

							{/* Form */}
							<form onSubmit={handleSubmit} className="space-y-4" noValidate>
								{/* Honeypot (hidden) */}
								<div style={{ display: 'none' }} aria-hidden>
									<label>Website</label>
									<input name="website" value={formData.website} onChange={handleChange} />
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label className="flex flex-col">
										<span className="text-sm mb-2">Full name</span>
										<input
											ref={firstInputRef}
											name="name"
											value={formData.name}
											onChange={handleChange}
											onBlur={handleBlur}
											required
											disabled={isFormDisabled}
											className={`px-4 py-3 rounded-lg bg-transparent border ${fieldErrors.name ? 'border-rose-400' : 'border-white/10'} focus:ring-2 focus:ring-cyan-400 outline-none`}
											placeholder="John Doe"
											aria-invalid={!!fieldErrors.name}
											aria-describedby={fieldErrors.name ? 'err-name' : undefined}
										/>
										{fieldErrors.name && <div id="err-name" className="text-rose-400 text-xs mt-1">{fieldErrors.name}</div>}
									</label>

									<label className="flex flex-col">
										<span className="text-sm mb-2">Email</span>
										<input
											name="email"
											type="email"
											value={formData.email}
											onChange={handleChange}
											onBlur={handleBlur}
											required
											disabled={isFormDisabled}
											className={`px-4 py-3 rounded-lg bg-transparent border ${fieldErrors.email ? 'border-rose-400' : 'border-white/10'} focus:ring-2 focus:ring-cyan-400 outline-none`}
											placeholder="you@example.com"
											aria-invalid={!!fieldErrors.email}
											aria-describedby={fieldErrors.email ? 'err-email' : undefined}
										/>
										{fieldErrors.email && <div id="err-email" className="text-rose-400 text-xs mt-1">{fieldErrors.email}</div>}
									</label>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label className="flex flex-col">
										<span className="text-sm mb-2">Phone</span>
										<input
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											onBlur={handleBlur}
											required
											disabled={isFormDisabled}
											className={`px-4 py-3 rounded-lg bg-transparent border ${fieldErrors.phone ? 'border-rose-400' : 'border-white/10'} focus:ring-2 focus:ring-cyan-400 outline-none`}
											placeholder="+91 93349 86732 or 09334986732"
											aria-invalid={!!fieldErrors.phone}
											aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
										/>
										{fieldErrors.phone && <div id="err-phone" className="text-rose-400 text-xs mt-1">{fieldErrors.phone}</div>}
										{formData.phone.trim().length > 0 && normalizePhone(formData.phone) && (
											<div className="text-xs text-slate-400 mt-1">Will be submitted as: <span className="font-mono">{normalizePhone(formData.phone)}</span></div>
										)}
									</label>

									<label className="flex flex-col">
										<span className="text-sm mb-2">Subject</span>
										<input
											name="subject"
											value={formData.subject}
											onChange={handleChange}
											onBlur={handleBlur}
											required
											disabled={isFormDisabled}
											className={`px-4 py-3 rounded-lg bg-transparent border ${fieldErrors.subject ? 'border-rose-400' : 'border-white/10'} focus:ring-2 focus:ring-cyan-400 outline-none`}
											placeholder="How can we help?"
											aria-invalid={!!fieldErrors.subject}
											aria-describedby={fieldErrors.subject ? 'err-subject' : undefined}
										/>
										{fieldErrors.subject && <div id="err-subject" className="text-rose-400 text-xs mt-1">{fieldErrors.subject}</div>}
									</label>
								</div>

								<label className="flex flex-col">
									<span className="text-sm mb-2">Message</span>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										onBlur={handleBlur}
										required
										rows={6}
										disabled={isFormDisabled}
										className={`px-4 py-3 rounded-lg bg-transparent border ${fieldErrors.message ? 'border-rose-400' : 'border-white/10'} focus:ring-2 focus:ring-cyan-400 outline-none resize-none`}
										placeholder="Tell us more..."
										aria-invalid={!!fieldErrors.message}
										aria-describedby={fieldErrors.message ? 'err-message' : undefined}
									/>
									<div className="flex items-center justify-between mt-1">
										{fieldErrors.message ? <div id="err-message" className="text-rose-400 text-xs">{fieldErrors.message}</div> : <div className="text-xs text-slate-400">Be as specific as possible — helps us respond faster.</div>}
										<div className="text-xs text-slate-400">{formData.message.length}/2000</div>
									</div>
								</label>

								<div className="flex items-center gap-4">
									<button
										type="submit"
										disabled={isFormDisabled || hasErrors}
										className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-white shadow ${accentGradient} ${isFormDisabled || hasErrors ? 'opacity-60 cursor-not-allowed' : ''}`}
										aria-disabled={isFormDisabled || hasErrors}
										aria-live="polite"
									>
										{isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
										<span>{isSubmitting ? 'Sending...' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Send Message'}</span>
									</button>

									<div className="text-sm text-slate-400">
										<div>Typical response time: <span className="font-medium text-slate-200">48–72 hours</span></div>
									</div>
								</div>
							</form>
						</main>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
