import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Mail,
	Send,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	ShieldCheck,
	Phone,
	AtSign,
} from 'lucide-react';
import { apiClient, publicClient } from '../services/api.js';
import { getToken, decodeToken } from '../utils/handleTokens.js';

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		lpuID: '',
		subject: '',
		message: '',
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');
	const [contacts, setContacts] = useState([]);
	const [adminLoading, setAdminLoading] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const token = getToken();
	const user = token ? decodeToken(token) : null;

	useEffect(() => {
		if (user?.adminID) {
			fetchContacts();
		}
	}, [user]);

	const fetchContacts = async () => {
		setAdminLoading(true);
		try {
			const response = await apiClient.get('/api/contacts/getall');
			const contactsArr = response.data.contacts?.docs || response.data.contacts || [];
			setContacts(contactsArr);
		} catch (error) {
			setError('Failed to fetch contacts');
		} finally {
			setAdminLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			await publicClient.post('/api/contact/send', formData);
			setSuccess(true);
			setFormData({
				name: '',
				email: '',
				phone: '',
				lpuID: '',
				subject: '',
				message: '',
			});
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to send message');
		} finally {
			setLoading(false);
		}
	};

	const markAsResolved = async (id) => {
		try {
			await apiClient.patch(`/api/contacts/${id}/resolve`);
			setContacts(
				contacts.map((contact) =>
					contact._id === id ? { ...contact, status: 'resolved' } : contact
				)
			);
		} catch (error) {
			setError('Failed to mark as resolved');
		}
	};

	const toggleExpand = (id) => {
		setExpandedId(expandedId === id ? null : id);
	};

	return (
		<div className="min-h-screen section-padding">
			<div className="page-container">
				{!user?.adminID ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="max-w-6xl mx-auto"
					>
						<div
							className="glass-card overflow-hidden"
							style={{
								background: 'var(--glass-bg)',
								border: '1px solid var(--glass-border)',
								borderRadius: '1.5rem',
								boxShadow: 'var(--shadow-lg)',
							}}
						>
							<div className="grid md:grid-cols-5 gap-0">
								{/* Left Sidebar */}
								<div
									className="md:col-span-2 p-8 md:p-12"
									style={{
										background:
											'linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 8%, transparent), color-mix(in srgb, var(--accent-2) 8%, transparent))',
										borderRight: '1px solid var(--glass-border)',
									}}
								>
									<div className="flex flex-col h-full">
										<div className="mb-8">
											<div
												className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
												style={{
													background:
														'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
													boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
												}}
											>
												<Mail className="w-8 h-8 text-white" />
											</div>
											<h2
												className="text-3xl md:text-4xl font-bold mb-3"
												style={{ color: 'var(--text-primary)' }}
											>
												Get in Touch
											</h2>
											<p
												className="text-base"
												style={{ color: 'var(--text-secondary)' }}
											>
												Have questions? We're here to help. Reach out to our
												team for assistance.
											</p>
										</div>

										<div className="space-y-6 mt-auto">
											<h3
												className="text-sm font-semibold uppercase tracking-wider mb-4"
												style={{ color: 'var(--text-muted)' }}
											>
												Contact Information
											</h3>

											{/* Phone */}
											<a
												href="tel:+919771072294"
												className="group flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
												style={{
													background: 'var(--glass-bg)',
													border: '1px solid var(--glass-border)',
												}}
											>
												<div
													className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
													style={{
														background:
															'color-mix(in srgb, var(--accent-1) 15%, transparent)',
														border: '1px solid color-mix(in srgb, var(--accent-1) 25%, transparent)',
													}}
												>
													<Phone
														className="w-5 h-5"
														style={{ color: 'var(--accent-1)' }}
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h4
														className="font-semibold mb-1"
														style={{ color: 'var(--text-primary)' }}
													>
														Phone Support
													</h4>
													<p
														className="text-sm font-mono transition-colors duration-300"
														style={{ color: 'var(--text-secondary)' }}
													>
														+91 9771072294
													</p>
												</div>
											</a>

											{/* Email */}
											<a
												href="mailto:vibranta.helpdesk@gmail.com"
												className="group flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
												style={{
													background: 'var(--glass-bg)',
													border: '1px solid var(--glass-border)',
												}}
											>
												<div
													className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
													style={{
														background:
															'color-mix(in srgb, var(--accent-2) 15%, transparent)',
														border: '1px solid color-mix(in srgb, var(--accent-2) 25%, transparent)',
													}}
												>
													<AtSign
														className="w-5 h-5"
														style={{ color: 'var(--accent-2)' }}
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h4
														className="font-semibold mb-1"
														style={{ color: 'var(--text-primary)' }}
													>
														Email Support
													</h4>
													<p
														className="text-sm break-all transition-colors duration-300"
														style={{ color: 'var(--text-secondary)' }}
													>
														vibranta.helpdesk@gmail.com
													</p>
												</div>
											</a>
										</div>
									</div>
								</div>

								{/* Right Form */}
								<div className="md:col-span-3 p-8 md:p-12">
									<h3
										className="text-2xl font-bold mb-2"
										style={{ color: 'var(--text-primary)' }}
									>
										Send us a message
									</h3>
									<p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
										Fill out the form below and we'll get back to you as soon as
										possible.
									</p>

									<AnimatePresence>
										{success && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0 }}
												className="mb-6 p-4 rounded-xl flex items-center gap-3"
												style={{
													background:
														'color-mix(in srgb, #10b981 15%, transparent)',
													border: '1px solid color-mix(in srgb, #10b981 30%, transparent)',
												}}
											>
												<CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
												<p className="text-sm font-medium text-green-400">
													Your message has been sent successfully!
												</p>
											</motion.div>
										)}
										{error && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0 }}
												className="mb-6 p-4 rounded-xl"
												style={{
													background:
														'color-mix(in srgb, #ef4444 15%, transparent)',
													border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
													color: '#fca5a5',
												}}
											>
												{error}
											</motion.div>
										)}
									</AnimatePresence>

									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<label
													className="block text-sm font-medium mb-2"
													style={{ color: 'var(--text-secondary)' }}
												>
													Full Name
												</label>
												<input
													type="text"
													name="name"
													value={formData.name}
													onChange={handleChange}
													required
													className="auth-input"
													placeholder="John Doe"
													style={{
														paddingLeft: '1rem',
														background: 'var(--glass-bg)',
														border: '1px solid var(--glass-border)',
														color: 'var(--text-primary)',
													}}
												/>
											</div>
											<div>
												<label
													className="block text-sm font-medium mb-2"
													style={{ color: 'var(--text-secondary)' }}
												>
													LPU ID
												</label>
												<input
													type="text"
													name="lpuID"
													value={formData.lpuID}
													onChange={handleChange}
													required
													className="auth-input"
													placeholder="12345678"
													style={{
														paddingLeft: '1rem',
														background: 'var(--glass-bg)',
														border: '1px solid var(--glass-border)',
														color: 'var(--text-primary)',
													}}
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<label
													className="block text-sm font-medium mb-2"
													style={{ color: 'var(--text-secondary)' }}
												>
													Email Address
												</label>
												<input
													type="email"
													name="email"
													value={formData.email}
													onChange={handleChange}
													required
													className="auth-input"
													placeholder="john@example.com"
													style={{
														paddingLeft: '1rem',
														background: 'var(--glass-bg)',
														border: '1px solid var(--glass-border)',
														color: 'var(--text-primary)',
													}}
												/>
											</div>
											<div>
												<label
													className="block text-sm font-medium mb-2"
													style={{ color: 'var(--text-secondary)' }}
												>
													Phone Number
												</label>
												<input
													type="tel"
													name="phone"
													value={formData.phone}
													onChange={handleChange}
													required
													className="auth-input"
													placeholder="+91 98765 43210"
													style={{
														paddingLeft: '1rem',
														background: 'var(--glass-bg)',
														border: '1px solid var(--glass-border)',
														color: 'var(--text-primary)',
													}}
												/>
											</div>
										</div>

										<div>
											<label
												className="block text-sm font-medium mb-2"
												style={{ color: 'var(--text-secondary)' }}
											>
												Subject
											</label>
											<input
												type="text"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												required
												className="auth-input"
												placeholder="How can we help?"
												style={{
													paddingLeft: '1rem',
													background: 'var(--glass-bg)',
													border: '1px solid var(--glass-border)',
													color: 'var(--text-primary)',
												}}
											/>
										</div>

										<div>
											<label
												className="block text-sm font-medium mb-2"
												style={{ color: 'var(--text-secondary)' }}
											>
												Message
											</label>
											<textarea
												name="message"
												value={formData.message}
												onChange={handleChange}
												required
												rows={5}
												className="auth-input resize-none"
												placeholder="Tell us more about your inquiry..."
												style={{
													paddingLeft: '1rem',
													background: 'var(--glass-bg)',
													border: '1px solid var(--glass-border)',
													color: 'var(--text-primary)',
												}}
											></textarea>
										</div>

										<motion.button
											type="submit"
											disabled={loading}
											whileHover={{ scale: loading ? 1 : 1.02 }}
											whileTap={{ scale: loading ? 1 : 0.98 }}
											className="btn btn-primary w-full py-4 text-base"
										>
											{loading ? (
												<>
													<svg
														className="animate-spin h-5 w-5"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Sending...
												</>
											) : (
												<>
													<Send className="w-5 h-5" />
													Send Message
												</>
											)}
										</motion.button>
									</form>
								</div>
							</div>
						</div>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="max-w-6xl mx-auto glass-card p-8 md:p-12"
						style={{
							background: 'var(--glass-bg)',
							border: '1px solid var(--glass-border)',
							borderRadius: '1.5rem',
							boxShadow: 'var(--shadow-lg)',
						}}
					>
						<div className="flex items-center gap-4 mb-8">
							<div
								className="w-14 h-14 rounded-xl flex items-center justify-center"
								style={{
									background:
										'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
								}}
							>
								<ShieldCheck className="w-7 h-7 text-white" />
							</div>
							<h2
								className="text-3xl font-bold"
								style={{ color: 'var(--text-primary)' }}
							>
								Contact Requests
							</h2>
						</div>

						{adminLoading ? (
							<div className="flex justify-center py-12">
								<div
									className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent"
									style={{ borderColor: 'var(--accent-1)' }}
								></div>
							</div>
						) : contacts.length === 0 ? (
							<div
								className="text-center py-16"
								style={{ color: 'var(--text-secondary)' }}
							>
								<Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
								<p className="text-lg">No contact requests found</p>
							</div>
						) : (
							<div className="space-y-4">
								{contacts.map((contact) => (
									<motion.div
										key={contact._id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="rounded-xl overflow-hidden transition-all duration-300"
										style={{
											background:
												contact.status === 'resolved'
													? 'color-mix(in srgb, #10b981 8%, var(--glass-bg))'
													: 'var(--glass-bg)',
											border: `1px solid ${
												contact.status === 'resolved'
													? 'color-mix(in srgb, #10b981 25%, var(--glass-border))'
													: 'var(--glass-border)'
											}`,
										}}
									>
										<div
											className="flex justify-between items-center p-5 cursor-pointer hover:bg-opacity-80 transition-all"
											onClick={() => toggleExpand(contact._id)}
										>
											<div className="flex items-center gap-4 flex-1">
												<div
													className="w-3 h-3 rounded-full flex-shrink-0"
													style={{
														background:
															contact.status === 'resolved'
																? '#10b981'
																: '#f59e0b',
													}}
												></div>
												<div className="flex-1 min-w-0">
													<h3
														className="font-semibold mb-1"
														style={{ color: 'var(--text-primary)' }}
													>
														{contact.subject}
													</h3>
													<p
														className="text-sm truncate"
														style={{ color: 'var(--text-secondary)' }}
													>
														{contact.name} • {contact.email}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span
													className="text-xs font-mono"
													style={{ color: 'var(--text-muted)' }}
												>
													{new Date(
														contact.createdAt
													).toLocaleDateString()}
												</span>
												{expandedId === contact._id ? (
													<ChevronUp
														className="w-5 h-5"
														style={{ color: 'var(--text-secondary)' }}
													/>
												) : (
													<ChevronDown
														className="w-5 h-5"
														style={{ color: 'var(--text-secondary)' }}
													/>
												)}
											</div>
										</div>

										<AnimatePresence>
											{expandedId === contact._id && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3 }}
													className="border-t"
													style={{ borderColor: 'var(--glass-border)' }}
												>
													<div className="p-6 space-y-4">
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div>
																<p
																	className="text-sm font-medium mb-1"
																	style={{
																		color: 'var(--text-muted)',
																	}}
																>
																	LPU ID
																</p>
																<p
																	className="font-mono"
																	style={{
																		color: 'var(--text-primary)',
																	}}
																>
																	{contact.lpuID}
																</p>
															</div>
															<div>
																<p
																	className="text-sm font-medium mb-1"
																	style={{
																		color: 'var(--text-muted)',
																	}}
																>
																	Phone
																</p>
																<p
																	className="font-mono"
																	style={{
																		color: 'var(--text-primary)',
																	}}
																>
																	{contact.phone}
																</p>
															</div>
														</div>
														<div>
															<p
																className="text-sm font-medium mb-2"
																style={{
																	color: 'var(--text-muted)',
																}}
															>
																Message
															</p>
															<p
																className="whitespace-pre-line leading-relaxed"
																style={{
																	color: 'var(--text-primary)',
																}}
															>
																{contact.message}
															</p>
														</div>
														{contact.status !== 'resolved' && (
															<motion.button
																whileHover={{ scale: 1.02 }}
																whileTap={{ scale: 0.98 }}
																onClick={() =>
																	markAsResolved(contact._id)
																}
																className="btn btn-primary px-6 py-3 text-sm"
																style={{
																	background:
																		'linear-gradient(135deg, #10b981, #059669)',
																}}
															>
																<CheckCircle2 className="w-4 h-4" />
																Mark as Resolved
															</motion.button>
														)}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								))}
							</div>
						)}
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default ContactPage;
